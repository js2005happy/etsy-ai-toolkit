import { createServiceClient } from '@/lib/supabase/service'
import { hasPaidAccess } from './access'
import {
  PRICE_TO_TIER,
  tierQuota,
  isYearlyPrice,
  getPlan,
  type TierName,
} from '@/lib/pricing'
import { commissionForPriceId } from '@/lib/referral'
import {
  sendNewSaleEmail,
  sendSubscriptionActiveEmail,
  sendSubscriptionCanceledEmail,
} from '@/lib/email'
import type {
  CustomerNotification,
  SubscriptionNotification,
  TransactionNotification,
} from '@paddle/paddle-node-sdk'

// Lazy-init so `next build`'s page-data collection (which executes module
// top-level code) doesn't construct a Supabase client before env vars load.
let serviceClient: ReturnType<typeof createServiceClient> | null = null
function getSupabase() {
  if (!serviceClient) serviceClient = createServiceClient()
  return serviceClient
}

type EntitlementSyncResult = {
  tier: TierName
  applied: boolean
}

const ENTITLEMENT_TRANSACTION_ORIGINS = new Set([
  'web',
  'subscription_recurring',
  'subscription_update',
])

// Map a subscription's price + status into the tier it should grant. Only
// active/trialing grant access. Unknown active price IDs never grant a paid
// entitlement: legitimate legacy prices must be explicitly allowlisted in
// PRICE_TO_TIER so a typo or foreign Paddle product cannot silently become Pro.
export function resolveTier(
  priceId: string | undefined,
  status: string | undefined
): TierName {
  if (!hasPaidAccess(status)) return 'Free'
  if (priceId && PRICE_TO_TIER[priceId]) return PRICE_TO_TIER[priceId]

  console.error('Unknown active Paddle price id; refusing paid entitlement', {
    priceId: priceId ?? null,
    status: status ?? null,
  })
  return 'Free'
}

async function resolveUserId(
  customerId: string,
  customDataUserId?: string
): Promise<string | undefined> {
  if (customDataUserId) return customDataUserId

  const { data } = await getSupabase()
    .from('profiles')
    .select('id')
    .eq('paddle_customer_id', customerId)
    .maybeSingle()

  return data?.id ?? undefined
}

async function resolveEmail(userId: string): Promise<string | undefined> {
  const { data } = await getSupabase().auth.admin.getUserById(userId)
  return data?.user?.email ?? undefined
}

async function resolveReferrer(userId: string): Promise<string | undefined> {
  const db = getSupabase()
  const { data: profile } = await db
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .maybeSingle()

  const code = profile?.referred_by
  if (!code) return undefined

  const { data: referrer } = await db
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (!referrer || referrer.id === userId) return undefined
  return referrer.id
}

async function currentStoredTier(userId: string): Promise<TierName> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to read current plan for user ${userId}`)

  const status = data?.subscription_status
  if (status === 'active' || status === 'trialing') return 'Pro'
  return getPlan(status).name
}

/**
 * Keep the existing first-payment ledger intact. The row is unique per referred
 * user, so repeated subscription activation events cannot double-credit.
 */
async function maybeCreditInitialReferral(
  userId: string,
  tier: TierName,
  priceId?: string
): Promise<void> {
  if (tier === 'Free') return
  const amount = commissionForPriceId(priceId)
  if (amount <= 0) return

  const affiliateId = await resolveReferrer(userId)
  if (!affiliateId) return

  await getSupabase().from('affiliate_commissions').upsert(
    {
      affiliate_id: affiliateId,
      referred_user_id: userId,
      tier,
      amount,
      currency: 'USD',
      status: 'paid',
    },
    { onConflict: 'referred_user_id', ignoreDuplicates: true }
  )
}

/**
 * Record 30% commission for a normal successful subscription renewal.
 *
 * Paddle also creates transactions for upgrades, downgrades, proration and
 * one-time subscription charges. Only `subscription_recurring` qualifies here,
 * preventing a mid-cycle plan change from paying a full extra commission.
 * The Paddle transaction ID is unique, so webhook retries are idempotent.
 */
async function maybeCreditRenewalReferral(args: {
  userId: string
  tier: TierName
  priceId?: string
  transactionId?: string
  subscriptionId?: string | null
  origin?: string
}): Promise<void> {
  const {
    userId,
    tier,
    priceId,
    transactionId,
    subscriptionId,
    origin,
  } = args

  if (origin !== 'subscription_recurring') return
  if (tier === 'Free' || !transactionId || !subscriptionId) return

  const amount = commissionForPriceId(priceId)
  if (amount <= 0) return

  const affiliateId = await resolveReferrer(userId)
  if (!affiliateId) return

  await getSupabase().from('affiliate_renewal_commissions').upsert(
    {
      affiliate_id: affiliateId,
      referred_user_id: userId,
      tier,
      amount,
      currency: 'USD',
      status: 'paid',
      paddle_transaction_id: transactionId,
      paddle_subscription_id: subscriptionId,
    },
    { onConflict: 'paddle_transaction_id', ignoreDuplicates: true }
  )
}

/**
 * Persist the Paddle customer → user link directly on the profile (single
 * source of truth; the customers mirror table is gone).
 */
export async function handleCustomer(data: CustomerNotification): Promise<void> {
  const userId = data.customData?.user_id as string | undefined
  if (!userId) return

  await getSupabase()
    .from('profiles')
    .update({ paddle_customer_id: data.id })
    .eq('id', userId)
}

/**
 * Store the subscription id and apply entitlement changes only when the event
 * actually changes the user's tier/status. Generic `subscription.updated`
 * events are common for metadata, scheduled cancellation, and billing-detail
 * changes, so a same-tier update must never refill quota.
 */
export async function handleSubscription(
  data: SubscriptionNotification,
  eventType?: string,
  occurredAt?: string
): Promise<void> {
  const userId = await resolveUserId(data.customerId, data.customData?.user_id)
  if (!userId) return

  await getSupabase()
    .from('profiles')
    .update({ paddle_subscription_id: data.id })
    .eq('id', userId)

  const priceId = data.items?.[0]?.price?.id
  const nextTier = resolveTier(priceId, data.status)

  // `subscription.updated` is a catch-all. Only apply it when the effective
  // entitlement actually changed; otherwise a cancel-at-period-end or metadata
  // update could refill the user's entire quota without a payment.
  if (eventType === 'subscription.updated') {
    const currentTier = await currentStoredTier(userId)
    if (currentTier === nextTier) return
  }

  const { tier, applied } = await syncUserPlan(
    userId,
    priceId,
    data.status,
    occurredAt
  )

  // A newer Paddle event has already won. Do not emit stale lifecycle emails or
  // affiliate side effects when an out-of-order event arrives later.
  if (!applied) return

  if (eventType === 'subscription.activated') {
    await maybeCreditInitialReferral(userId, tier, priceId)
    const email = await resolveEmail(userId)
    if (email) await sendSubscriptionActiveEmail(email, tier.toLowerCase())
  } else if (eventType === 'subscription.canceled') {
    const email = await resolveEmail(userId)
    if (email) await sendSubscriptionCanceledEmail(email)
  }
}

/**
 * transaction.completed backfills the customer/subscription links and — for
 * checkout, renewal, and subscription-change transactions only — recomputes the
 * user's entitlement. One-time subscription charges and payment-method-change
 * transactions must not modify plan access or refill quota.
 */
export async function handleTransactionCompleted(
  data: TransactionNotification,
  occurredAt?: string
): Promise<void> {
  const userId = data.customData?.user_id as string | undefined
  if (!userId) return

  if (data.customerId) {
    await getSupabase()
      .from('profiles')
      .update({ paddle_customer_id: data.customerId })
      .eq('id', userId)
  }
  if (data.subscriptionId) {
    await getSupabase()
      .from('profiles')
      .update({ paddle_subscription_id: data.subscriptionId })
      .eq('id', userId)
  }

  const priceId = data.items?.[0]?.price?.id
  let tier: TierName = priceId ? resolveTier(priceId, 'active') : 'Free'

  if (
    priceId &&
    data.origin &&
    ENTITLEMENT_TRANSACTION_ORIGINS.has(data.origin)
  ) {
    const result = await syncUserPlan(
      userId,
      priceId,
      'active',
      occurredAt
    )
    tier = result.tier
  }

  if (data.status === 'completed') {
    await maybeCreditRenewalReferral({
      userId,
      tier,
      priceId,
      transactionId: data.id,
      subscriptionId: data.subscriptionId,
      origin: data.origin,
    })

    const total = data.details?.totals?.total
    const totalMinor = total == null ? 0 : Number(total)
    if (Number.isFinite(totalMinor) && totalMinor > 0) {
      const buyerEmail = await resolveEmail(userId)
      await sendNewSaleEmail({
        buyerEmail,
        amount: total!,
        currency: data.currencyCode,
        tier,
      })
    }
  }
}

/**
 * Recompute a user's tier and reset their credit/image quota. Writes the
 * denormalized `profiles.subscription_status` flag (free | basic | pro | scale).
 *
 * Paddle webhook delivery is at-least-once and not ordered. When occurredAt is
 * provided, the database update is conditional on this event being newer than
 * the last entitlement-changing event already applied to the profile.
 */
export async function syncUserPlan(
  userId: string,
  priceId?: string,
  status?: string,
  occurredAt?: string
): Promise<EntitlementSyncResult> {
  const tier = resolveTier(priceId, status)
  const quota = tierQuota(tier)

  // Yearly subs intentionally grant the monthly quota as a 12× lump at purchase.
  // Keep website copy aligned with this behavior: yearly plans are annual pools,
  // not monthly-reset subscriptions.
  const multiplier = isYearlyPrice(priceId) ? 12 : 1

  const update = {
    subscription_status: tier.toLowerCase(),
    credits_remaining: quota.credits * multiplier,
    images_remaining: quota.images * multiplier,
    ...(occurredAt ? { paddle_entitlement_event_at: occurredAt } : {}),
  }

  let query = getSupabase()
    .from('profiles')
    .update(update)
    .eq('id', userId)

  if (occurredAt) {
    query = query.or(
      `paddle_entitlement_event_at.is.null,paddle_entitlement_event_at.lt.${occurredAt}`
    )
  }

  const { data, error } = await query.select('id').maybeSingle()

  if (error) {
    throw new Error(`Failed to sync Paddle entitlement for user ${userId}`)
  }

  if (occurredAt && !data) {
    console.info('Skipped stale Paddle entitlement event', {
      userId,
      occurredAt,
      tier,
    })
    return { tier, applied: false }
  }

  return { tier, applied: true }
}

import { createServiceClient } from '@/lib/supabase/service'
import { hasPaidAccess } from './access'
import {
  PRICE_TO_TIER,
  tierQuota,
  isYearlyPrice,
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
 * Store the subscription id (for the portal) and recompute the user's tier +
 * quota from the subscription's price and status. Emits lifecycle emails on
 * activation and cancellation.
 */
export async function handleSubscription(
  data: SubscriptionNotification,
  eventType?: string
): Promise<void> {
  const userId = await resolveUserId(data.customerId, data.customData?.user_id)
  if (!userId) return

  await getSupabase()
    .from('profiles')
    .update({ paddle_subscription_id: data.id })
    .eq('id', userId)

  const priceId = data.items?.[0]?.price?.id
  const tier = await syncUserPlan(userId, priceId, data.status)

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
 * transaction.completed backfills the customer/subscription links and — in case
 * subscription events were missed — recomputes tier from the line-item price.
 * Paddle emits a completed `subscription_recurring` transaction for each
 * successful renewal, which is the source of truth for recurring commissions.
 */
export async function handleTransactionCompleted(
  data: TransactionNotification
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
  let tier: TierName = 'Free'
  if (priceId) {
    tier = await syncUserPlan(userId, priceId, 'active')
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
    if (total) {
      const buyerEmail = await resolveEmail(userId)
      await sendNewSaleEmail({
        buyerEmail,
        amount: total,
        currency: data.currencyCode,
        tier,
      })
    }
  }
}

/**
 * Recompute a user's tier and reset their credit/image quota. Writes the
 * denormalized `profiles.subscription_status` flag (free | basic | pro | scale).
 */
export async function syncUserPlan(
  userId: string,
  priceId?: string,
  status?: string
): Promise<TierName> {
  const tier = resolveTier(priceId, status)
  const quota = tierQuota(tier)

  // Yearly subs intentionally grant the monthly quota as a 12× lump at purchase.
  // Keep website copy aligned with this behavior: yearly plans are annual pools,
  // not monthly-reset subscriptions.
  const multiplier = isYearlyPrice(priceId) ? 12 : 1

  const { error } = await getSupabase()
    .from('profiles')
    .update({
      subscription_status: tier.toLowerCase(),
      credits_remaining: quota.credits * multiplier,
      images_remaining: quota.images * multiplier,
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to sync Paddle entitlement for user ${userId}`)
  }

  return tier
}

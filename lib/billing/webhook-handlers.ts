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

function isCommissionableTransactionOrigin(origin: string | undefined): boolean {
  return origin === 'web' || origin === 'subscription_recurring'
}

/**
 * Credit the referrer for each successful subscription payment.
 *
 * Only initial web checkouts and normal subscription renewals qualify. Paddle
 * creates separate `subscription_update` transactions for upgrades/downgrades
 * and proration; excluding those prevents a mid-cycle plan change from paying
 * a full extra affiliate commission.
 *
 * Idempotency is per Paddle transaction ID. Legacy first-payment rows have no
 * transaction ID, so an old initial checkout is detected separately before a
 * new recurring row is created.
 */
async function maybeCreditReferral(args: {
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

  if (tier === 'Free' || !transactionId || !subscriptionId) return
  if (!isCommissionableTransactionOrigin(origin)) return

  const amount = commissionForPriceId(priceId)
  if (amount <= 0) return

  const db = getSupabase()

  const { data: profile } = await db
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .maybeSingle()

  const code = profile?.referred_by
  if (!code) return

  const { data: referrer } = await db
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (!referrer || referrer.id === userId) return

  // Before recurring commissions existed, the initial subscription activation
  // wrote one row with no Paddle transaction ID. If Paddle retries that old
  // checkout after the migration, do not create a duplicate initial payout.
  if (origin === 'web') {
    const { data: legacyInitial } = await db
      .from('affiliate_commissions')
      .select('id')
      .eq('referred_user_id', userId)
      .is('paddle_transaction_id', null)
      .limit(1)

    if (legacyInitial?.length) return
  }

  await db.from('affiliate_commissions').upsert(
    {
      affiliate_id: referrer.id,
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
 * It is also the source of truth for recurring affiliate commissions because
 * Paddle emits a completed transaction for every successful renewal.
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
    await maybeCreditReferral({
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

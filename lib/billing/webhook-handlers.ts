import { createServiceClient } from '@/lib/supabase/service'
import { hasPaidAccess } from './access'
import { PRICE_TO_TIER, tierQuota, type TierName } from '@/lib/pricing'
import { sendSubscriptionActiveEmail, sendSubscriptionCanceledEmail } from '@/lib/email'
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
// active/trialing grant access; anything else downgrades to free. An unknown
// active price_id (legacy rows) defaults to Pro so existing subscribers keep
// image access.
function resolveTier(
  priceId: string | undefined,
  status: string | undefined
): TierName {
  if (!hasPaidAccess(status)) return 'Free'
  if (priceId && PRICE_TO_TIER[priceId]) return PRICE_TO_TIER[priceId]
  return 'Pro'
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
  if (priceId) {
    await syncUserPlan(userId, priceId, 'active')
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

  await getSupabase()
    .from('profiles')
    .update({
      subscription_status: tier.toLowerCase(),
      credits_remaining: quota.credits,
      images_remaining: quota.images,
    })
    .eq('id', userId)

  return tier
}

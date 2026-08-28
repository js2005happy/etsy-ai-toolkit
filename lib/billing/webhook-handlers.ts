import { createServiceClient } from '@/lib/supabase/service'
import { hasPaidAccess } from './access'
import type {
  CustomerNotification,
  SubscriptionNotification,
  TransactionNotification,
} from '@paddle/paddle-node-sdk'

const supabase = createServiceClient()

function now() {
  return new Date().toISOString()
}

/**
 * Upsert a Paddle customer into the mirror. Keyed on the Paddle customer ID,
 * so at-least-once / duplicate deliveries are idempotent.
 */
export async function handleCustomer(data: CustomerNotification): Promise<void> {
  const userId = (data.customData?.user_id as string | undefined) ?? null

  await supabase.from('customers').upsert(
    {
      customer_id: data.id,
      user_id: userId,
      email: data.email,
      updated_at: now(),
    },
    { onConflict: 'customer_id' }
  )
}

/**
 * Upsert a Paddle subscription into the mirror, then recompute the linked
 * user's paid access from the source of truth (`subscriptions.status`).
 */
export async function handleSubscription(
  data: SubscriptionNotification
): Promise<void> {
  const item = data.items?.[0]
  const priceId = item?.price?.id ?? ''
  const productId = item?.price?.productId ?? item?.product?.id ?? ''

  await supabase.from('subscriptions').upsert(
    {
      subscription_id: data.id,
      customer_id: data.customerId,
      status: data.status,
      price_id: priceId,
      product_id: productId,
      scheduled_change_action: data.scheduledChange?.action ?? null,
      scheduled_change_at: data.scheduledChange?.effectiveAt ?? null,
      updated_at: now(),
    },
    { onConflict: 'subscription_id' }
  )

  const userId = await resolveUserId(data.customerId, data.customData?.user_id)
  if (userId) {
    await syncUserPlan(userId)
  }
}

/**
 * transaction.completed is the reliable "payment captured" signal. It backfills
 * the customer -> user link (without clobbering a known email) and recomputes
 * access in case subscription events were missed.
 */
export async function handleTransactionCompleted(
  data: TransactionNotification
): Promise<void> {
  const userId = data.customData?.user_id as string | undefined
  if (!userId) return

  if (data.customerId) {
    await supabase
      .from('customers')
      .update({ user_id: userId, updated_at: now() })
      .eq('customer_id', data.customerId)
      .is('user_id', null)
  }

  await syncUserPlan(userId)
}

async function resolveUserId(
  customerId: string,
  customDataUserId?: string
): Promise<string | undefined> {
  if (customDataUserId) return customDataUserId

  const { data } = await supabase
    .from('customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()

  return data?.user_id ?? undefined
}

/**
 * Recompute a user's paid access from all of their subscriptions and write the
 * denormalized `profiles.plan` flag. Grants `pro` if any subscription is
 * `active` or `trialing`, otherwise `free`.
 */
export async function syncUserPlan(userId: string): Promise<void> {
  const { data: customers } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', userId)

  const customerIds = (customers ?? []).map((c) => c.customer_id)
  if (customerIds.length === 0) return

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('status')
    .in('customer_id', customerIds)

  const pro = (subscriptions ?? []).some((s) => hasPaidAccess(s.status))

  await supabase
    .from('profiles')
    .update({ plan: pro ? 'pro' : 'free' })
    .eq('id', userId)
}

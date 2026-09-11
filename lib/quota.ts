import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'

// Atomic quota reservations are server-only. The SECURITY DEFINER RPCs remain
// guarded in SQL, but application calls always use the service-role client so
// anon/authenticated execution can be revoked at the database boundary.
export async function consumeCredits(
  _db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const service = createServiceClient()
  const { data, error } = await service.rpc('consume_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) {
    console.error('consume_credits RPC failed', { userId, amount, error })
    return false
  }
  return data === true
}

export async function consumeImageCredits(
  _db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const service = createServiceClient()
  const { data, error } = await service.rpc('consume_image_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) {
    console.error('consume_image_credits RPC failed', { userId, amount, error })
    return false
  }
  return data === true
}

// Refund RPCs are intentionally service-role only. An authenticated browser
// must never be able to increase its own quota by calling these functions
// directly. The caller-provided db argument is retained for API compatibility,
// but compensation always uses the server-only service client.
export async function refundCredits(
  _db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const service = createServiceClient()
  const { data, error } = await service.rpc('refund_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) {
    console.error('refund_credits RPC failed', { userId, amount, error })
    return false
  }
  return data === true
}

export async function refundImageCredits(
  _db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const service = createServiceClient()
  const { data, error } = await service.rpc('refund_image_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) {
    console.error('refund_image_credits RPC failed', { userId, amount, error })
    return false
  }
  return data === true
}

export type UsageChargeResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: 'insufficient_quota' }

/**
 * Reserve one or more text credits before calling a metered provider. If the
 * provider operation throws, refund exactly the reservation from this call.
 * This closes the generate-first/charge-later concurrency leak without
 * duplicating reservation/refund code in every route.
 *
 * Note: HTTP retries after a successful provider call still need a caller-
 * supplied idempotency key to be perfectly de-duplicated. The current API does
 * not expose a stable key across every legacy client, so we intentionally do
 * not pretend to solve that case here.
 */
export async function withCreditCharge<T>(
  db: SupabaseClient,
  userId: string,
  amount: number,
  operation: () => Promise<T>
): Promise<UsageChargeResult<T>> {
  const reserved = await consumeCredits(db, userId, amount)
  if (!reserved) return { ok: false, reason: 'insufficient_quota' }

  try {
    return { ok: true, value: await operation() }
  } catch (error) {
    const refunded = await refundCredits(db, userId, amount)
    if (!refunded) {
      console.error('Credit reservation refund failed after provider error', { userId, amount })
    }
    throw error
  }
}

export async function withImageCreditCharge<T>(
  db: SupabaseClient,
  userId: string,
  amount: number,
  operation: () => Promise<T>
): Promise<UsageChargeResult<T>> {
  const reserved = await consumeImageCredits(db, userId, amount)
  if (!reserved) return { ok: false, reason: 'insufficient_quota' }

  try {
    return { ok: true, value: await operation() }
  } catch (error) {
    const refunded = await refundImageCredits(db, userId, amount)
    if (!refunded) {
      console.error('Image credit reservation refund failed after provider error', { userId, amount })
    }
    throw error
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'

// Atomic quota decrements. These call SECURITY DEFINER RPCs (see migration
// 0012) so the decrement is a single `credits_remaining = credits_remaining - n`
// guarded by `>= n` — no read-then-write race between the auth snapshot and the
// writeback. Returns false only when the caller actually ran out of quota
// (concurrent requests drained it between the auth snapshot and this call).
export async function consumeCredits(
  db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const { data, error } = await db.rpc('consume_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) return false
  return data === true
}

export async function consumeImageCredits(
  db: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const { data, error } = await db.rpc('consume_image_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) return false
  return data === true
}

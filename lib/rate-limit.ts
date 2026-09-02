import type { SupabaseClient } from '@supabase/supabase-js'

// Sliding-window rate limit backed by the `generations` log. No Redis needed —
// each generate request already writes a row, so counting recent rows is a cheap
// exact query. Fails open (returns false) on any DB error so a transient hiccup
// never blocks a paying user.
const WINDOW_SECONDS = 60
const MAX_GENERATIONS_PER_WINDOW = 30

export async function isRateLimited(
  db: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString()
    const { count, error } = await db
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)
    if (error) return false
    return (count ?? 0) >= MAX_GENERATIONS_PER_WINDOW
  } catch {
    return false
  }
}

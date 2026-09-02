import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isRateLimited } from '@/lib/rate-limit'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TierName } from '@/lib/pricing'

// MCP keys are stored hashed so a DB leak can't expose live credentials. The
// plaintext key is only shown to the user once, at generation time.
export function hashMcpKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export type AuthContext = {
  db: SupabaseClient
  userId: string
  tier: TierName
  plan: string
  credits: number
  imageCredits: number
  hasImageAccess: boolean
}

export type AuthResult = AuthContext | { error: string; status: number }

// Production `profiles.subscription_status` holds the tier ('free' | 'basic' |
// 'pro' | 'scale'). Legacy Paddle rows used 'active'/'trialing' before tiers
// existed — map those to 'Pro' so existing subscribers keep image access.
function resolveTier(status: string | null | undefined): TierName {
  if (status === 'basic') return 'Basic'
  if (status === 'pro') return 'Pro'
  if (status === 'scale') return 'Scale'
  if (status === 'active' || status === 'trialing') return 'Pro'
  return 'Free'
}

function buildContext(
  db: SupabaseClient,
  userId: string,
  profile: {
    credits_remaining: number | null
    images_remaining: number | null
    subscription_status: string | null
  }
): AuthContext {
  const tier = resolveTier(profile.subscription_status)
  return {
    db,
    userId,
    tier,
    plan: tier.toLowerCase(),
    credits: profile.credits_remaining ?? 0,
    imageCredits: profile.images_remaining ?? 0,
    // Quota-driven, not tier-driven: Free carries a small trial allotment and
    // any plan with 0 images simply has no access.
    hasImageAccess: (profile.images_remaining ?? 0) > 0,
  }
}

/**
 * Resolves the caller identity for API routes. Two paths:
 *  - `x-mcp-key` header matching a user's `profiles.mcp_api_key` → that user's
 *    quota, via a service-role client (MCP requests carry no browser session).
 *  - otherwise → the browser's Supabase session cookie.
 */
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const mcpKey = request.headers.get('x-mcp-key')

  if (mcpKey) {
    const db = createServiceClient()
    const keyHash = hashMcpKey(mcpKey)
    let { data: profile } = await db
      .from('profiles')
      .select('id, credits_remaining, images_remaining, subscription_status')
      .eq('mcp_api_key', keyHash)
      .maybeSingle()

    // Backward-compat: keys issued before hashing were stored in plaintext.
    // Match the legacy value once, then upgrade it in place to the hash.
    if (!profile) {
      const { data: legacy } = await db
        .from('profiles')
        .select('id, credits_remaining, images_remaining, subscription_status')
        .eq('mcp_api_key', mcpKey)
        .maybeSingle()
      if (legacy) {
        await db.from('profiles').update({ mcp_api_key: keyHash }).eq('id', legacy.id)
        profile = legacy
      }
    }

    if (!profile) {
      return { error: 'Invalid MCP key', status: 401 }
    }

    if (await isRateLimited(db, profile.id)) {
      return { error: 'Too many requests. Please slow down.', status: 429 }
    }

    return buildContext(db, profile.id, profile)
  }

  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits_remaining, images_remaining, subscription_status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profile not found', status: 404 }
  }

  if (await isRateLimited(supabase, user.id)) {
    return { error: 'Too many requests. Please slow down.', status: 429 }
  }

  return buildContext(supabase, user.id, profile)
}

// Brand preferences live on the profile but are read lazily (only by the tools
// that shape on-brand copy), so a not-yet-applied `brand_tone`/`brand_keywords`
// migration can't break the core generation path.
export async function getBrandPrefs(
  db: SupabaseClient,
  userId: string
): Promise<{ brandTone: string | null; brandKeywords: string | null }> {
  try {
    const { data } = await db
      .from('profiles')
      .select('brand_tone, brand_keywords')
      .eq('id', userId)
      .maybeSingle()
    return { brandTone: data?.brand_tone ?? null, brandKeywords: data?.brand_keywords ?? null }
  } catch {
    return { brandTone: null, brandKeywords: null }
  }
}

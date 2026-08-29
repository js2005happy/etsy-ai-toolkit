import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TierName } from '@/lib/pricing'

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
    hasImageAccess: tier === 'Pro' || tier === 'Scale',
  }
}

/**
 * Resolves the caller identity for API routes. Two paths:
 *  - `x-mcp-key` header matching MCP_API_KEY → service-role client acting as the
 *    MCP service account (MCP_USER_ID), bypassing RLS.
 *  - otherwise → the browser's Supabase session cookie.
 */
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const mcpKey = request.headers.get('x-mcp-key')

  if (mcpKey) {
    if (mcpKey !== process.env.MCP_API_KEY) {
      return { error: 'Invalid MCP key', status: 401 }
    }
    const mcpUserId = process.env.MCP_USER_ID
    if (!mcpUserId) {
      return { error: 'MCP user not configured', status: 500 }
    }

    const db = createServiceClient()
    const { data: profile } = await db
      .from('profiles')
      .select('credits_remaining, images_remaining, subscription_status')
      .eq('id', mcpUserId)
      .single()

    if (!profile) {
      return { error: 'MCP user profile not found', status: 404 }
    }

    return buildContext(db, mcpUserId, profile)
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

  return buildContext(supabase, user.id, profile)
}

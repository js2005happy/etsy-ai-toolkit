import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { exchangeCode, getUserShops } from '@/lib/etsy'

export const dynamic = 'force-dynamic'

// GET /api/etsy/callback — Etsy redirects here after the seller approves the
// app. Verifies state, exchanges the code (with PKCE verifier) for tokens,
// resolves the seller's shops, and stores one connection per shop.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const savedState = cookies().get('etsy_oauth_state')?.value
  const codeVerifier = cookies().get('etsy_oauth_verifier')?.value

  const fail = () => NextResponse.redirect(new URL('/account?etsy=error', url.origin))

  if (!code) return fail()
  if (!state || state !== savedState) return fail()
  if (!codeVerifier) return fail()

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  try {
    const token = await exchangeCode(code, codeVerifier)
    const shops = await getUserShops(token.accessToken)

    const service = createServiceClient()
    const now = new Date().toISOString()
    for (const shop of shops) {
      await service.from('etsy_connections').upsert(
        {
          user_id: user.id,
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
          token_expires_at: new Date(token.expiresAt).toISOString(),
          scopes: 'listings_w listings_r shops_r',
          updated_at: now,
        },
        { onConflict: 'user_id,shop_id' }
      )
    }

    cookies().delete('etsy_oauth_state')
    cookies().delete('etsy_oauth_verifier')
    return NextResponse.redirect(new URL('/account?etsy=connected', url.origin))
  } catch (error: any) {
    console.error('Etsy callback error:', error)
    return fail()
  }
}

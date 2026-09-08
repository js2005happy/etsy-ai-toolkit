import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { exchangeCode, getUserShops } from '@/lib/etsy'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const savedState = cookieStore.get('etsy_oauth_state')?.value
  const codeVerifier = cookieStore.get('etsy_oauth_verifier')?.value
  const fail = () => NextResponse.redirect(new URL('/account?etsy=error', url.origin))
  if (!code || !state || state !== savedState || !codeVerifier) return fail()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', url.origin))

  try {
    const token = await exchangeCode(code, codeVerifier)
    const shops = await getUserShops(token.accessToken)
    const service = createServiceClient()
    const now = new Date().toISOString()
    for (const shop of shops) {
      await service.from('etsy_connections').upsert({
        user_id: user.id, shop_id: shop.shop_id, shop_name: shop.shop_name,
        access_token: token.accessToken, refresh_token: token.refreshToken,
        token_expires_at: new Date(token.expiresAt).toISOString(),
        scopes: 'listings_w listings_r shops_r', updated_at: now,
      }, { onConflict: 'user_id,shop_id' })
    }
    cookieStore.delete('etsy_oauth_state')
    cookieStore.delete('etsy_oauth_verifier')
    return NextResponse.redirect(new URL('/account?etsy=connected', url.origin))
  } catch (error: any) {
    console.error('Etsy callback error:', error)
    return fail()
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { exchangeToken } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

// GET /api/shopify/callback — Shopify redirects here after the merchant
// approves the app. Verifies the CSRF state, exchanges the code for a
// permanent access token, and stores the connection for the signed-in user.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const shop = url.searchParams.get('shop')
  const state = url.searchParams.get('state')
  const savedState = cookies().get('shopify_oauth_state')?.value

  const fail = () => NextResponse.redirect(new URL('/account?shopify=error', url.origin))

  if (!code || !shop) return fail()
  if (!state || state !== savedState) return fail()

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  try {
    const { accessToken, scopes } = await exchangeToken(shop, code)
    const service = createServiceClient()
    await service.from('shopify_connections').upsert(
      {
        user_id: user.id,
        shop_domain: shop,
        access_token: accessToken,
        scopes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,shop_domain' }
    )
    cookies().delete('shopify_oauth_state')
    return NextResponse.redirect(new URL('/account?shopify=connected', url.origin))
  } catch (error: any) {
    console.error('Shopify callback error:', error)
    return fail()
  }
}

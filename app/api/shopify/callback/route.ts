import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { exchangeToken } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const shop = url.searchParams.get('shop')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const savedState = cookieStore.get('shopify_oauth_state')?.value
  const fail = () => NextResponse.redirect(new URL('/account?shopify=error', url.origin))
  if (!code || !shop || !state || state !== savedState) return fail()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', url.origin))
  try {
    const { accessToken, scopes } = await exchangeToken(shop, code)
    const service = createServiceClient()
    await service.from('shopify_connections').upsert({
      user_id: user.id, shop_domain: shop, access_token: accessToken, scopes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,shop_domain' })
    cookieStore.delete('shopify_oauth_state')
    return NextResponse.redirect(new URL('/account?shopify=connected', url.origin))
  } catch (error: any) {
    console.error('Shopify callback error:', error)
    return fail()
  }
}

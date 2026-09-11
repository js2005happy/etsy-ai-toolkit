import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { encryptCommerceSecret } from '@/lib/commerce/secret-box'
import { exchangeEbayCode, getEbayUser } from '@/lib/ebay'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')
  if (errorParam) return NextResponse.redirect(new URL(`/account?ebay=error&reason=${encodeURIComponent(errorParam)}`, request.url))

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('ebay_oauth_state')?.value
  cookieStore.delete('ebay_oauth_state')
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL('/account?ebay=invalid_state', request.url))
  }

  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const tokens = await exchangeEbayCode(code)
    const identity = await getEbayUser(tokens.accessToken)
    const accountKey = String(identity?.username || identity?.userId || identity?.email || crypto.randomUUID()).slice(0, 240)
    const label = String(identity?.username || identity?.email || 'eBay seller').slice(0, 120)
    const encrypted = encryptCommerceSecret({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      marketplaceId: 'EBAY_US',
    })
    const service = createServiceClient()
    const expiresAt = new Date(Date.now() + Math.max(tokens.expiresIn, 60) * 1000).toISOString()
    const { error } = await service.from('commerce_connections').upsert({
      user_id: auth.userId,
      platform: 'ebay',
      account_label: label,
      account_key: accountKey,
      credentials_encrypted: encrypted,
      scopes: ['sell.inventory','sell.account'],
      token_expires_at: expiresAt,
      status: 'active',
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform,account_key' })
    if (error) throw error
    return NextResponse.redirect(new URL('/account?ebay=connected', request.url))
  } catch (error) {
    console.error('eBay OAuth callback failed', error)
    return NextResponse.redirect(new URL('/account?ebay=error', request.url))
  }
}

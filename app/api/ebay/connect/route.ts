import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateRequest } from '@/lib/auth'
import { buildEbayAuthorizeUrl } from '@/lib/ebay'

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.redirect(new URL('/login', request.url))
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('ebay_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return NextResponse.redirect(buildEbayAuthorizeUrl(state))
}

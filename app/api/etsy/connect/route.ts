import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildAuthorizeUrl, generateCodeChallenge, generateCodeVerifier } from '@/lib/etsy'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const state = crypto.randomUUID()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const cookieStore = await cookies()
  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 600, path: '/' }
  cookieStore.set('etsy_oauth_state', state, cookieOpts)
  cookieStore.set('etsy_oauth_verifier', codeVerifier, cookieOpts)
  return NextResponse.redirect(buildAuthorizeUrl(state, codeChallenge))
}

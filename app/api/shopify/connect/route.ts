import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildInstallUrl } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))
  const shop = new URL(request.url).searchParams.get('shop')
  if (!shop) return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('shopify_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return NextResponse.redirect(buildInstallUrl(shop, state))
}

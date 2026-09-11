import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json({ ok: false, stage: 'app-config', reason: 'missing-supabase-url' }, { status: 500 })
  }

  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const redirectTo = `${origin}/auth/callback?next=/dashboard`
  const authorizeUrl = new URL('/auth/v1/authorize', supabaseUrl)
  authorizeUrl.searchParams.set('provider', 'google')
  authorizeUrl.searchParams.set('redirect_to', redirectTo)

  try {
    const response = await fetch(authorizeUrl, {
      redirect: 'manual',
      cache: 'no-store',
      headers: { 'User-Agent': 'Craftly-OAuth-Diagnostics/1.0' },
    })

    const location = response.headers.get('location')
    if (!location) {
      const body = await response.text().catch(() => '')
      return NextResponse.json(
        {
          ok: false,
          stage: 'supabase-authorize',
          reason: 'no-provider-redirect',
          status: response.status,
          detail: body.slice(0, 180),
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const googleUrl = new URL(location)
    const clientId = googleUrl.searchParams.get('client_id') ?? ''
    const providerRedirect = googleUrl.searchParams.get('redirect_uri') ?? ''
    const expectedRedirect = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/callback`

    const checks = {
      googleHost: googleUrl.hostname === 'accounts.google.com',
      clientIdShape: /^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId),
      redirectUri: providerRedirect === expectedRedirect,
      responseType: Boolean(googleUrl.searchParams.get('response_type')),
      scope: Boolean(googleUrl.searchParams.get('scope')),
    }

    const ok = Object.values(checks).every(Boolean)
    return NextResponse.json(
      {
        ok,
        stage: ok ? 'ready' : 'google-request-shape',
        checks,
        expected_google_callback: expectedRedirect,
        configured_client_id_suffix_ok: clientId.endsWith('.apps.googleusercontent.com'),
      },
      { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        stage: 'diagnostic-request',
        reason: error instanceof Error ? error.message : 'unknown-error',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

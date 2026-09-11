import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNext(requestUrl.searchParams.get('next'))

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const publicOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin

  const successUrl = new URL(next, publicOrigin)
  const failureUrl = new URL('/login', publicOrigin)
  failureUrl.searchParams.set('error', 'oauth-callback-failed')

  if (!code) {
    failureUrl.searchParams.set('reason', 'missing-code')
    return NextResponse.redirect(failureUrl)
  }

  const response = NextResponse.redirect(successUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('Google OAuth callback failed', {
      message: error?.message,
      status: error?.status,
      hasSession: Boolean(data.session),
    })
    failureUrl.searchParams.set('reason', error?.code ?? 'session-not-created')
    return NextResponse.redirect(failureUrl)
  }

  return response
}

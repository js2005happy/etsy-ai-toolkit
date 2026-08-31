import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. 刷新会话并获取用户身份
  const { response, user } = await updateSession(request)

  const url = new URL(request.url)

  // Capture ?ref=CODE into a 30-day cookie so referral attribution survives
  // the signup flow (which may span several page loads).
  const ref = url.searchParams.get('ref')
  if (ref) {
    response.cookies.set('referral_code', ref, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  }

  const isAuthRoute = url.pathname === '/login' || url.pathname === '/signup'
  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') || url.pathname === '/account'

  // 逻辑 A: 用户已登录，但尝试访问登录/注册页 -> 跳转到 /dashboard
  if (user && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // 逻辑 B: 用户未登录，但尝试访问保护路由 -> 跳转到 /login
  if (!user && isProtectedRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
}
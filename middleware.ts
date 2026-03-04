import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session token (NextAuth v5 uses 'authjs' prefix)
  const sessionToken =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token') ||
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token')

  // Public routes — no auth required
  const isPublicRoute =
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/membership') ||
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/resources') &&
    !pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/ai') &&
    !pathname.startsWith('/api/pages') &&
    !pathname.startsWith('/api/blog') &&
    !pathname.startsWith('/api/media') &&
    !pathname.startsWith('/api/events') &&
    !pathname.startsWith('/api/resources') &&
    !pathname.startsWith('/api/awards') &&
    !pathname.startsWith('/api/contacts') &&
    !pathname.startsWith('/api/members') &&
    !pathname.startsWith('/api/categories') &&
    !pathname.startsWith('/api/tags') &&
    !pathname.startsWith('/api/navigation') &&
    !pathname.startsWith('/api/settings')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Admin routes — require admin/editor session
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/ai') || pathname.startsWith('/api/pages') ||
      pathname.startsWith('/api/blog') || pathname.startsWith('/api/media') ||
      pathname.startsWith('/api/events') || pathname.startsWith('/api/resources') ||
      pathname.startsWith('/api/awards') || pathname.startsWith('/api/contacts') ||
      pathname.startsWith('/api/members') || pathname.startsWith('/api/categories') ||
      pathname.startsWith('/api/tags') || pathname.startsWith('/api/navigation') ||
      pathname.startsWith('/api/settings')) {
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Member-gated routes — require any authenticated session
  if (pathname.startsWith('/resources')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection and auth state.
 *
 * Checks for the presence of the session cookie (not its validity —
 * that's handled when the server actually calls the WP API).
 *
 * If the cookie is missing on a protected route, redirects to /login.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('sysblok_session')
  const { pathname } = request.nextUrl

  // Protected route patterns — add more as needed
  const protectedPatterns = ['/drafts', '/private']

  const isProtectedRoute = protectedPatterns.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  )

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('return_to', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

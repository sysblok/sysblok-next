import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const loginSlug = process.env.LOGIN_SLUG || 'login'
const isCustomSlug = loginSlug !== 'login'

/**
 * Proxy: hides the /login route behind a configurable slug.
 *
 * When LOGIN_SLUG is set to a custom value (e.g. "xk39fm2q"):
 * - /{LOGIN_SLUG}        → rewrites to /login  (route handler)
 * - /{LOGIN_SLUG}/error  → rewrites to /login/error (error page)
 * - /login or /login/error directly → 404
 *
 * When LOGIN_SLUG is unset or "login": no rewriting, no blocking.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isCustomSlug && (pathname === '/login' || pathname === '/login/error')) {
    return NextResponse.rewrite(new URL('/_not-found', request.url))
  }

  // Rewrite /{LOGIN_SLUG} → /login
  if (isCustomSlug && pathname === `/${loginSlug}`) {
    return NextResponse.rewrite(new URL('/login', request.url))
  }

  // Rewrite /{LOGIN_SLUG}/error → /login/error (preserve query params)
  if (isCustomSlug && pathname === `/${loginSlug}/error`) {
    const rewriteUrl = new URL('/login/error', request.url)
    rewriteUrl.search = request.nextUrl.search
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}

export const config = {
  // /:path matches any single-segment path (/{slug}, /login, etc.)
  // /:path/error matches /{slug}/error, /login/error, etc.
  // This is intentionally broad — the proxy function does fast string
  // comparisons and returns NextResponse.next() for non-login paths.
  matcher: ['/:path', '/:path/error'],
}

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, buildLoginUrl } from '@/lib/auth'

const wpAdminUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/`

/**
 * GET /login?return_to=/some/path&error=...
 *
 * Route Handler for login. No page is rendered.
 * - If ?error= present: redirects to /login/error for display
 * - If already logged in: redirects to WP admin
 * - Otherwise: sets CSRF state cookie and redirects to WP login page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const returnTo = searchParams.get('return_to') || undefined
  const error = searchParams.get('error')

  // If error param present, pass through to error page
  if (error) {
    const errorUrl = new URL('/login/error', request.url)
    errorUrl.searchParams.set('error', error)
    return NextResponse.redirect(errorUrl)
  }

  // If already logged in, redirect to WP admin
  const user = await getCurrentUser()
  if (user) {
    return NextResponse.redirect(wpAdminUrl)
  }

  // Generate CSRF state and redirect to WP login
  const state = crypto.randomUUID()
  const loginUrl = buildLoginUrl(state, returnTo)

  const response = NextResponse.redirect(loginUrl)
  response.cookies.set('auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}

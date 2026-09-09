import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession, wordpressAuthFetch } from '@/lib/auth'

/**
 * GET /api/auth/callback?code=...&state=...&return_to=...
 *
 * Called by WordPress after successful login.
 * Exchanges the one-time auth code for a session token,
 * then creates an encrypted session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  // Default redirect: WP admin (editors' natural starting point)
  const wpAdminUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/`
  const returnTo = searchParams.get('return_to') || wpAdminUrl

  if (!code) {
    return NextResponse.redirect(new URL('/login/error?error=missing_code', request.url))
  }

  // CSRF: verify state parameter matches the cookie we set before login
  const cookieStore = await cookies()
  const storedState = cookieStore.get('auth_state')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login/error?error=invalid_state', request.url))
  }

  try {
    // Exchange the auth code for a session token via WP REST API
    const verifyResponse = await wordpressAuthFetch('/auth/verify', { code })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json().catch(() => ({}))
      console.error('Auth verify failed:', verifyResponse.status, error)
      return NextResponse.redirect(new URL('/login/error?error=auth_failed', request.url))
    }

    const data = await verifyResponse.json()

    // Create the encrypted session cookie
    const session = await getSession()
    session.user = {
      id: data.user.id,
      displayName: data.user.display_name,
      email: data.user.email,
      roles: data.user.roles,
    }
    session.token = data.token
    session.expiresAt = Date.now() + data.expires_in * 1000
    await session.save()

    // Clean up the state cookie
    // returnTo may be an absolute URL (WP admin) or relative path
    const redirectUrl = returnTo.startsWith('http')
      ? returnTo
      : new URL(returnTo, request.url).toString()
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('auth_state')

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login/error?error=server_error', request.url))
  }
}

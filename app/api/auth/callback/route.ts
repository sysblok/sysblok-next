import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession, wordpressAuthFetch } from '@/lib/auth'
import { LOGIN_SLUG, WP_ADMIN_URL } from '@/lib/login-config'

function errorRedirect(error: string): NextResponse {
  // NEXT_PUBLIC_URL, not request.url: behind a reverse proxy the latter may be the internal host
  const response = NextResponse.redirect(
    new URL(`/${LOGIN_SLUG}/error?error=${error}`, process.env.NEXT_PUBLIC_URL),
  )
  response.cookies.delete('auth_state')
  return response
}

/**
 * GET /api/auth/callback?code=...&state=...
 *
 * Called by WordPress after successful login.
 * Exchanges the one-time auth code for a session token,
 * creates an encrypted session cookie and redirects to WP admin.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return errorRedirect('missing_code')
  }

  // CSRF: verify state parameter matches the cookie we set before login
  const cookieStore = await cookies()
  const storedState = cookieStore.get('auth_state')?.value

  if (!state || !storedState || state !== storedState) {
    return errorRedirect('invalid_state')
  }

  try {
    // Exchange the auth code for a session token via WP REST API
    const verifyResponse = await wordpressAuthFetch('/auth/verify', { code })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json().catch(() => ({}))
      console.error('Auth verify failed:', verifyResponse.status, error)
      return errorRedirect('auth_failed')
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

    const response = NextResponse.redirect(WP_ADMIN_URL)
    response.cookies.delete('auth_state')

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return errorRedirect('server_error')
  }
}

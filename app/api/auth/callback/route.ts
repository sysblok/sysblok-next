import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/auth'

const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
const authSecret = process.env.WP_AUTH_SHARED_SECRET

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
  const returnTo = searchParams.get('return_to') || '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  // CSRF: verify state parameter matches the cookie we set before login
  const cookieStore = await cookies()
  const storedState = cookieStore.get('auth_state')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
  }

  if (!wpBaseUrl || !authSecret) {
    console.error('Missing WP_AUTH_SHARED_SECRET or NEXT_PUBLIC_WORDPRESS_URL')
    return NextResponse.redirect(new URL('/login?error=config_error', request.url))
  }

  try {
    // Exchange the auth code for a session token via WP REST API
    const verifyResponse = await fetch(`${wpBaseUrl}/wp-json/sysblok/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, secret: authSecret }),
      cache: 'no-store',
    })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json().catch(() => ({}))
      console.error('Auth verify failed:', verifyResponse.status, error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const data = await verifyResponse.json()

    // Create the encrypted session cookie
    const session = await getIronSession<SessionData>(cookieStore, getSessionOptions())
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
    const response = NextResponse.redirect(new URL(returnTo, request.url))
    response.cookies.delete('auth_state')

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}

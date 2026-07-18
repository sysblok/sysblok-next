import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/auth'

const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
const authSecret = process.env.WP_AUTH_SHARED_SECRET

/**
 * POST /api/auth/logout
 *
 * Destroys the Next.js session and invalidates the token on WordPress side.
 */
export async function POST() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, getSessionOptions())

  // Invalidate the token on WordPress side
  if (session.token && wpBaseUrl && authSecret) {
    try {
      await fetch(`${wpBaseUrl}/wp-json/sysblok/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token, secret: authSecret }),
        cache: 'no-store',
      })
    } catch (error) {
      // Log but don't block logout if WP is unreachable
      console.error('Failed to invalidate token on WordPress:', error)
    }
  }

  // Destroy the session cookie
  session.destroy()

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))
}

import { NextResponse } from 'next/server'
import { getSession, authSharedSecret } from '@/lib/auth'

const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL

/**
 * POST /api/auth/logout
 *
 * Destroys the Next.js session and invalidates the token on WordPress side.
 */
export async function POST() {
  const session = await getSession()

  // Invalidate the token on WordPress side
  if (session.token && wpBaseUrl) {
    try {
      await fetch(`${wpBaseUrl}/wp-json/sysblok/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token, secret: authSharedSecret }),
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

import { NextResponse } from 'next/server'
import { getSession, wordpressAuthFetch } from '@/lib/auth'

/**
 * POST /api/auth/logout
 *
 * Destroys the Next.js session and invalidates the token on WordPress side.
 */
export async function POST() {
  const session = await getSession()

  // Invalidate the token on WordPress side
  if (session.token) {
    try {
      await wordpressAuthFetch('/auth/logout', { token: session.token })
    } catch (error) {
      // Log but don't block logout if WP is unreachable
      console.error('Failed to invalidate token on WordPress:', error)
    }
  }

  // Destroy the session cookie
  session.destroy()

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))
}

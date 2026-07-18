// Session management for headless WordPress authentication
// Uses iron-session for encrypted cookie-based sessions

import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: number
  displayName: string
  email: string
  roles: string[]
}

export interface SessionData {
  user?: SessionUser
  token?: string
  expiresAt?: number
}

export function getSessionOptions(): SessionOptions {
  const sessionSecret = process.env.AUTH_SESSION_SECRET
  if (!sessionSecret) {
    throw new Error('AUTH_SESSION_SECRET environment variable is not defined')
  }
  return {
    password: sessionSecret,
    cookieName: 'sysblok_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours (matches WP token TTL)
      path: '/',
    },
  }
}

/**
 * Get the current session from cookies.
 * Returns session data (may be empty if not logged in).
 */
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, getSessionOptions())
}

/**
 * Get the current user from the session, or null if not logged in.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  if (!session.user || !session.token) {
    return null
  }
  return session.user
}

/**
 * Get the WP session token for authenticated API calls, or null if not logged in.
 */
export async function getAuthToken(): Promise<string | null> {
  const session = await getSession()
  if (!session.token) {
    return null
  }
  return session.token
}

/**
 * Build the WordPress login URL with proper redirect_to and CSRF state.
 * The state is stored in a short-lived cookie for verification on callback.
 */
export function buildLoginUrl(state: string, returnTo?: string): string {
  const wpLoginUrl = process.env.NEXT_PUBLIC_WP_LOGIN_URL
  const publicUrl = process.env.NEXT_PUBLIC_URL

  if (!wpLoginUrl || !publicUrl) {
    throw new Error('NEXT_PUBLIC_WP_LOGIN_URL and NEXT_PUBLIC_URL must be defined')
  }

  const callbackUrl = new URL('/api/auth/callback', publicUrl)
  callbackUrl.searchParams.set('state', state)
  if (returnTo) {
    callbackUrl.searchParams.set('return_to', returnTo)
  }

  const loginUrl = new URL(wpLoginUrl)
  loginUrl.searchParams.set('redirect_to', callbackUrl.toString())

  return loginUrl.toString()
}

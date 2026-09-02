// Session management for headless WordPress authentication
// Uses iron-session for encrypted cookie-based sessions

import { getIronSession, type IronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

// ---------------------------------------------------------------------------
// Environment variable checks (fail fast on startup if missing)
// NEXT_PUBLIC_WORDPRESS_URL is already checked in wordpress.ts
// ---------------------------------------------------------------------------

const wpLoginSlug = process.env.WORDPRESS_LOGIN_SLUG
if (!wpLoginSlug) {
  throw new Error('WORDPRESS_LOGIN_SLUG environment variable is not defined')
}

const publicUrl = process.env.NEXT_PUBLIC_URL
if (!publicUrl) {
  throw new Error('NEXT_PUBLIC_URL environment variable is not defined')
}

const authSharedSecret = process.env.WP_AUTH_SHARED_SECRET
if (!authSharedSecret) {
  throw new Error('WP_AUTH_SHARED_SECRET environment variable is not defined')
}

if (!process.env.AUTH_SESSION_SECRET) {
  throw new Error('AUTH_SESSION_SECRET environment variable is not defined')
}
const sessionSecret: string = process.env.AUTH_SESSION_SECRET

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

const sessionOptions: SessionOptions = {
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

/**
 * Get the current session from cookies.
 * Returns session data (may be empty if not logged in).
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
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
 * Validate the current session by checking the token against WordPress.
 * If the token is invalid (expired, revoked), destroys the session.
 * Returns the user if valid, null if invalid or not logged in.
 */
export async function validateSession(): Promise<SessionUser | null> {
  const session = await getSession()

  if (!session.user || !session.token) {
    return null
  }

  // Check if the token is still valid by calling WP REST API
  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
  try {
    const response = await fetch(`${wpBaseUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    if (response.ok) {
      return session.user
    }
  } catch {
    // If WP is unreachable, keep the session (don't log out on network errors)
    return session.user
  }

  // Token is invalid — destroy the session
  session.destroy()
  return null
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Generate a CSRF state parameter and store it in a cookie.
 * Returns the state string for use in the login URL.
 */
export async function createAuthState(): Promise<string> {
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes — enough time to complete login + 2FA
    path: '/',
  })
  return state
}

/**
 * Build the WordPress login URL with proper redirect_to and CSRF state.
 * The state is stored in a short-lived cookie for verification on callback.
 */
export function buildLoginUrl(state: string, returnTo?: string): string {
  const callbackUrl = new URL('/api/auth/callback', publicUrl)
  callbackUrl.searchParams.set('state', state)
  if (returnTo) {
    callbackUrl.searchParams.set('return_to', returnTo)
  }

  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
  const loginUrl = new URL(`${wpBaseUrl}/${wpLoginSlug}`)
  loginUrl.searchParams.set('redirect_to', callbackUrl.toString())

  return loginUrl.toString()
}
// ---------------------------------------------------------------------------
// WordPress auth API
// ---------------------------------------------------------------------------

/**
 * POST to a WordPress auth endpoint (/wp-json/sysblok/v1/...).
 * Automatically includes the shared secret in the request body.
 */
export async function wordpressAuthFetch(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
  return fetch(`${wpBaseUrl}/wp-json/sysblok/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, secret: authSharedSecret }),
    cache: 'no-store',
  })
}

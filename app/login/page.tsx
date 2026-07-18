import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Section, Container } from '@/components/craft'
import { getCurrentUser, buildLoginUrl } from '@/lib/auth'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to access private content',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; return_to?: string }>
}) {
  // If already logged in, redirect to home
  const user = await getCurrentUser()
  if (user) {
    redirect('/')
  }

  const { error, return_to } = await searchParams

  async function loginAction() {
    'use server'
    // Generate CSRF state and store in cookie
    const state = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set('auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes — enough time to complete login + 2FA
      path: '/',
    })

    const loginUrl = buildLoginUrl(state, return_to)
    redirect(loginUrl)
  }

  const errorMessages: Record<string, string> = {
    missing_code: 'Authentication failed: no authorization code received.',
    invalid_state: 'Authentication failed: invalid state parameter. Please try again.',
    auth_failed: 'Authentication failed. Please check your credentials and try again.',
    config_error: 'Server configuration error. Please contact the administrator.',
    server_error: 'An unexpected error occurred. Please try again.',
    session_expired: 'Your session has expired. Please log in again.',
  }

  const errorMessage = error ? errorMessages[error] || 'An error occurred.' : null

  return (
    <Section>
      <Container className="max-w-md">
        <div className="flex flex-col gap-6 not-prose">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-muted-foreground">
            Log in with your WordPress account to access private content.
          </p>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <form action={loginAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
            >
              Log in with WordPress
            </button>
          </form>
        </div>
      </Container>
    </Section>
  )
}

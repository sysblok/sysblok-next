import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from './logout-button'

/**
 * Thin bar displayed below the main nav when a user is logged in.
 * Shows the user's display name and a logout button.
 * Hidden when not authenticated.
 */
export async function AuthBar() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="auth-bar">
      <div className="container-fluid container-fluid-with-max-width">
        <div className="auth-bar-inner">
          <span className="auth-bar-user">{user.displayName}</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

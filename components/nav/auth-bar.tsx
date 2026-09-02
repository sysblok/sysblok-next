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
    <div className="bg-neutral-100 border-b border-neutral-200 text-xs">
      <div className="w-full px-4 mx-auto lg:max-w-[1170px]">
        <div className="flex items-center justify-end gap-4 py-1">
          <span className="text-neutral-500">{user.displayName}</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

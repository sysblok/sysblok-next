import { validateSession } from '@/lib/auth'

const wpAdminUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/`

/**
 * Thin bar displayed below the main nav when a user is logged in.
 * Hidden when not authenticated.
 * Validates the session token against WordPress on each render
 */
export async function AuthBar() {
  const user = await validateSession()

  if (!user) {
    return null
  }

  return (
    <div className="bg-neutral-100 border-b border-neutral-200 text-xs">
      <div className="w-full px-4 mx-auto lg:max-w-[1170px]">
        <div className="flex items-center justify-end gap-4 py-1">
          <span className="text-neutral-500">{user.displayName}</span>
          <a
            href={wpAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 underline hover:text-neutral-700 text-xs"
          >
            Админ-панель
          </a>
        </div>
      </div>
    </div>
  )
}

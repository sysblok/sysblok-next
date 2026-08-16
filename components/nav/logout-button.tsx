'use client'

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit" className="auth-bar-logout">
        Выйти
      </button>
    </form>
  )
}

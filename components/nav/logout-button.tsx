'use client'

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="text-neutral-500 underline hover:text-neutral-700 text-xs cursor-pointer bg-transparent border-none p-0 font-inherit"
      >
        Выйти
      </button>
    </form>
  )
}

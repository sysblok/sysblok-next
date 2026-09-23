import Link from 'next/link'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ошибка входа',
  description: 'Произошла ошибка при авторизации',
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Ошибка аутентификации: код авторизации не получен.',
  invalid_state: 'Ошибка аутентификации: недействительный параметр состояния. Попробуйте ещё раз.',
  auth_failed: 'Ошибка аутентификации. Проверьте учётные данные и попробуйте ещё раз.',
  config_error: 'Ошибка конфигурации сервера. Обратитесь к администратору.',
  server_error: 'Произошла непредвиденная ошибка. Попробуйте ещё раз.',
}

export default async function LoginErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] || 'Произошла ошибка.' : 'Произошла ошибка.'

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="max-w-md w-full px-4">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Ошибка входа</h1>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 h-11 px-8 w-full"
          >
            Попробовать снова
          </Link>
        </div>
      </div>
    </div>
  )
}

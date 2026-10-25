import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtmlTags(htmlString: string): string {
  if (!htmlString || typeof htmlString !== 'string') {
    return ''
  }
  return htmlString.replace(/<[^>]*>/g, '')
}

export function extractExcerptText(excerpt: string): string {
  if (!excerpt || typeof excerpt !== 'string') {
    return ''
  }
  const matches = excerpt.match(/<p>([\s\S]*)<\/p>/)
  return matches ? stripHtmlTags(matches[1]).trim() : ''
}

// 29.09.2026
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Путь как на WordPress: /<рубрика>/<slug> для постов, /<slug> (с родителями) для страниц.
// Берём его из постоянной ссылки, т.к. рубрика в url — основная (Yoast), а не первая в списке.
export function postHref(post: { link: string }): string {
  return new URL(post.link).pathname.replace(/\/+$/, '') || '/'
}

export function truncateWords(text: string, count: number): string {
  return text.split(' ').slice(0, count).join(' ').trim()
}

const isWordChar = (ch: string | undefined) => !!ch && /[\p{L}\p{N}_]/u.test(ch)

// Порт description_shortener из темы WP: обрезаем до max символов по границе слова,
// убираем хвостовые « .,:;!?-_» и добавляем trimMarker.
export function shortenDescription(text: string, max: number, trimMarker = '...'): string {
  const chars = Array.from(text)
  if (chars.length <= max) return text

  let end = max
  while (end > 0 && isWordChar(chars[end - 1]) === isWordChar(chars[end])) end--

  return (
    chars
      .slice(0, end || max)
      .join('')
      .replace(/[ .,:;!?\-_]+$/, '') + trimMarker
  )
}

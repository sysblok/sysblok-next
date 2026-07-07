import type { NavItem } from './wordpress.d'

const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL

export function wordpressUrlToNextPath(url?: string): string | undefined {
  if (!url) return undefined

  try {
    const urlObj = new URL(url, wordpressUrl)
    let pathname = urlObj.pathname

    if (pathname !== '/') {
      pathname = pathname.replace(/\/$/, '')
    }

    const categoryMatch = pathname.match(/^\/category\/([^/]+)$/)
    if (categoryMatch) {
      return `/posts?category=${categoryMatch[1]}`
    }

    if (pathname === '/about') {
      return '/pages/about'
    }

    return pathname
  } catch {
    return undefined
  }
}

/**
 * Extracts top-level <li>...</li> blocks with proper depth counting.
 * Regex with non-greedy *? breaks on nested <li> — it stops at the first
 * </li> found, which may belong to a child element, not the parent.
 */
function extractTopLevelLis(html: string): string[] {
  const result: string[] = []
  let depth = 0
  let start = -1
  let i = 0

  while (i < html.length) {
    if (html[i] === '<') {
      if (html.startsWith('<li', i) && (html[i + 3] === ' ' || html[i + 3] === '>')) {
        if (depth === 0) start = i
        depth++
        i += 3
        continue
      }
      if (html.startsWith('</li>', i)) {
        if (depth > 0) depth--
        if (depth === 0 && start !== -1) {
          result.push(html.slice(start, i + 5))
          start = -1
        }
        i += 5
        continue
      }
    }
    i++
  }

  return result
}

function parseLiItem(liHtml: string): NavItem | null {
  const isSubmenu = /\bwp-block-navigation-submenu\b/.test(liHtml)

  const labelMatch = liHtml.match(
    /<span[^>]*\bclass="[^"]*\bwp-block-navigation-item__label\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  )
  const label = labelMatch ? labelMatch[1].trim() : ''
  if (!label) return null

  const descMatch = liHtml.match(
    /<span[^>]*\bclass="[^"]*\bwp-block-navigation-item__description\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  )
  const description = descMatch ? descMatch[1].trim() : undefined

  const hrefMatch = liHtml.match(/<a[^>]*\bhref="([^"]*)"/i)
  const rawHref = hrefMatch ? hrefMatch[1] : undefined
  const href = wordpressUrlToNextPath(rawHref)

  const item: NavItem = { label, href, description }

  if (isSubmenu) {
    const subUlMatch = liHtml.match(
      /<ul[^>]*\bclass="[^"]*\bwp-block-navigation__submenu-container\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/i,
    )
    if (subUlMatch) {
      const childLis = extractTopLevelLis(subUlMatch[1])
      item.children = childLis
        .map((child) => parseLiItem(child))
        .filter((x): x is NavItem => x !== null)
    }
  }

  return item
}

export function parseNavigationHtml(html: string): NavItem[] {
  const topLevelLis = extractTopLevelLis(html)
  return topLevelLis.map((li) => parseLiItem(li)).filter((x): x is NavItem => x !== null)
}

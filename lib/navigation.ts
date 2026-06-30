import type { NavItem } from './wordpress.d'

const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL

export function wordpressUrlToNextPath(url?: string): string | undefined {
  if (!url) return undefined

  try {
    const urlObj = new URL(url, wordpressUrl)
    let pathname = urlObj.pathname

    // Remove trailing slash for consistency (except root)
    if (pathname !== '/') {
      pathname = pathname.replace(/\/$/, '')
    }

    // Map /category/{slug}/ to /posts?category={slug}
    const categoryMatch = pathname.match(/^\/category\/([^/]+)$/)
    if (categoryMatch) {
      return `/posts?category=${categoryMatch[1]}`
    }

    // Map specific known pages to /pages/{slug}
    if (pathname === '/about') {
      return '/pages/about'
    }

    // Posts/custom paths: strip domain, keep pathname
    return pathname
  } catch {
    return undefined
  }
}

export function parseNavigationHtml(html: string): NavItem[] {
  const items: NavItem[] = []
  // Matches <li> with wp-block-navigation-item class, handles attribute order
  const liRegex = /<li[^>]*\bclass="[^"]*\bwp-block-navigation-item\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi

  let match
  while ((match = liRegex.exec(html)) !== null) {
    const liContent = match[1]
    const fullLiTag = match[0]

    const isSubmenu = /\bwp-block-navigation-submenu\b/.test(fullLiTag)

    const labelMatch = liContent.match(
      /<span[^>]*\bclass="[^"]*\bwp-block-navigation-item__label\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
    )
    const label = labelMatch ? labelMatch[1].trim() : ''

    if (!label) continue

    const descMatch = liContent.match(
      /<span[^>]*\bclass="[^"]*\bwp-block-navigation-item__description\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
    )
    const description = descMatch ? descMatch[1].trim() : undefined

    const hrefMatch = liContent.match(/<a[^>]*\bhref="([^"]*)"/i)
    const rawHref = hrefMatch ? hrefMatch[1] : undefined
    const href = wordpressUrlToNextPath(rawHref)

    const item: NavItem = { label, href, description }

    if (isSubmenu) {
      const subUlMatch = liContent.match(
        /<ul[^>]*\bclass="[^"]*\bwp-block-navigation__submenu-container\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/i,
      )
      if (subUlMatch) {
        item.children = parseSubmenuHtml(subUlMatch[1])
      }
    }

    items.push(item)
  }

  return items
}

function parseSubmenuHtml(html: string): NavItem[] {
  const items: NavItem[] = []
  const liRegex = /<li[^>]*\bclass="[^"]*\bwp-block-navigation-item\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi

  let match
  while ((match = liRegex.exec(html)) !== null) {
    const liContent = match[1]
    const labelMatch = liContent.match(
      /<span[^>]*\bclass="[^"]*\bwp-block-navigation-item__label\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
    )
    const label = labelMatch ? labelMatch[1].trim() : ''

    if (!label) continue

    const hrefMatch = liContent.match(/<a[^>]*\bhref="([^"]*)"/i)
    const rawHref = hrefMatch ? hrefMatch[1] : undefined
    const href = wordpressUrlToNextPath(rawHref)

    items.push({ label, href })
  }

  return items
}

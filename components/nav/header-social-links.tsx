import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/social-links'

// Порядок здесь = порядок иконок в шапке.
// platform: значение из SOCIAL_LINKS, modifier: суффикс класса для hover-цвета из CSS
const HEADER_LINKS = [
  { platform: 'vk', modifier: 'vk' },
  { platform: 'x', modifier: 'twitter' },
  { platform: 'telegram', modifier: 'telegram' },
]

export function HeaderSocialLinks() {
  const links = HEADER_LINKS.flatMap(({ platform, modifier }) => {
    const link = SOCIAL_LINKS.find((l) => l.platform === platform)
    return link ? [{ ...link, modifier }] : []
  })

  if (links.length === 0) return null

  return (
    <div className="header-social-links">
      {links.map(({ href, platform, icon: Icon, modifier }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-button-link social-button-link--${modifier}`}
          aria-label={platform}
        >
          <Icon aria-label={platform} />
        </Link>
      ))}
    </div>
  )
}

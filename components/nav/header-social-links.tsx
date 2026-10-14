import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/social-links'

// Порядок здесь = порядок иконок в шапке.
const HEADER_LINKS: (keyof typeof SOCIAL_LINKS)[] = ['vk', 'x', 'telegram']

export function HeaderSocialLinks() {
  const links = HEADER_LINKS.map((platform) => SOCIAL_LINKS[platform])

  if (links.length === 0) return null

  return (
    <div className="header-social-links">
      {links.map(({ href, platform, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-button-link social-button-link--${platform}`}
          aria-label={platform}
        >
          <Icon aria-hidden="true" />
        </Link>
      ))}
    </div>
  )
}

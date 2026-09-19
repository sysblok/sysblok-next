import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/social-links'

// Порядок здесь = порядок иконок в шапке
const HEADER_PLATFORMS = ['vk', 'x', 'telegram']

export function HeaderSocialLinks() {
  const links = HEADER_PLATFORMS.map((name) =>
    SOCIAL_LINKS.find((link) => link.platform === name),
  ).filter((link): link is (typeof SOCIAL_LINKS)[number] => Boolean(link))
  console.log(SOCIAL_LINKS.map((l) => l.platform))

  if (links.length === 0) return null

  return (
    <div className="header-social-links">
      {links.map(({ href, platform, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button-link"
          aria-label={platform}
        >
          <Icon aria-label={platform} />
        </Link>
      ))}
    </div>
  )
}

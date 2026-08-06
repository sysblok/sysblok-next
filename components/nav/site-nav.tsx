import Link from 'next/link'
import { Search } from 'lucide-react'
import { getMenu } from '@/lib/wordpress'
import { siteConfig } from '@/site.config'
import { MobileNav } from './mobile-nav'
import { DesktopMenu } from './desktop-menu'
import { HeaderSocialLinks } from './header-social-links'
import type { NavItem } from '@/lib/wordpress.d'

export async function SiteNav() {
  let items: NavItem[] = []
  try {
    items = await getMenu('desktop-menu')
  } catch (e) {
    console.error('Failed to fetch navigation:', e)
  }

  return (
    <section className="section section-menu-stripe">
      <div className="container-fluid container-fluid-with-max-width">
        <div className="menu-stripe-wrapper">
          <div className="menu-stripe-left">
            <div className="site-logo text-logo-wrapper">
              <Link href="/" className="logo-link">
                <span className="text-logo">{siteConfig.site_name}</span>
              </Link>
            </div>
          </div>
          <div className="menu-stripe-center">
            <DesktopMenu items={items} />
            <MobileNav items={items} />
          </div>
          <div className="menu-stripe-right">
            <HeaderSocialLinks />
            <span className="header-search-link" aria-label="Поиск">
              <Search size={18} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

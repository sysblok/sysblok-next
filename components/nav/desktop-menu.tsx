'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { NavItem } from '@/lib/wordpress.d'

interface DesktopMenuProps {
  items: NavItem[]
}

export function DesktopMenu({ items }: DesktopMenuProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <nav className="sysblok-navbar">
      <ul className="navbar-nav">
        {items.map((item) => {
          const itemId = item.label
          const hasChildren = item.children && item.children.length > 0
          const isOpen = openId === itemId

          if (hasChildren) {
            return (
              <li
                key={itemId}
                className={isOpen ? 'open' : ''}
                onMouseEnter={() => setOpenId(itemId)}
                onMouseLeave={() => setOpenId(null)}
              >
                <button
                  className="dropdown-toggle nav-link"
                  onClick={() => setOpenId(isOpen ? null : itemId)}
                  aria-expanded={isOpen}
                >
                  {item.label}
                </button>
                <ul className="dropdown-menu">
                  {item.children!.map((child) => (
                    <li key={child.label}>
                      <Link href={child.href || '#'} className="dropdown-item">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )
          }

          return (
            <li key={itemId}>
              <Link href={item.href || '#'} className="nav-link">
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

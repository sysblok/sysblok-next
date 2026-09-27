'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/wordpress.d'

interface MenuContextValue {
  open: boolean
  openId: string | null
  setOpenId: (id: string | null) => void
  toggle: () => void
  close: () => void
}

const MenuContext = React.createContext<MenuContextValue | null>(null)

function useMenu() {
  const ctx = React.useContext(MenuContext)
  if (!ctx) throw new Error('useMenu нужно вызывать внутри <MenuProvider>')
  return ctx
}

/** Общее состояние для кнопки-бургера и меню */
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const close = React.useCallback(() => {
    setOpen(false)
    setOpenId(null)
  }, [])

  const toggle = React.useCallback(() => {
    if (open) close()
    else setOpen(true)
  }, [open, close])

  const value = React.useMemo(
    () => ({ open, openId, setOpenId, toggle, close }),
    [open, openId, toggle, close],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

/** Кнопка бургер-меню — переключается в крестик (на десктопе скрывается через CSS) */
export function MenuToggle() {
  const { open, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      className="menu-toggle-btn"
      aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={open}
      aria-controls="site-menu"
    >
      {open ? <X size={24} /> : <Menu size={24} />}
    </button>
  )
}

/** Единственный <nav> для десктопа и мобильных */
export function SiteMenu({ items, children }: { items: NavItem[]; children?: React.ReactNode }) {
  const { open, openId, setOpenId, close } = useMenu()

  return (
    <nav id="site-menu" className={cn('sysblok-navbar', open && 'sysblok-navbar-open')}>
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
                // hover только для мыши: на touch-устройствах тап вызывает
                // эмулированный hover, и раздел сразу бы закрывался кликом
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setOpenId(itemId)
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') setOpenId(null)
                }}
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
                      <Link href={child.href || '#'} className="dropdown-item" onClick={close}>
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
              <Link href={item.href || '#'} className="nav-link" onClick={close}>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      {/* Слот под соцсети: показывается только на мобильных (см. CSS) */}
      {children}
    </nav>
  )
}

'use client'

import { useEffect, useRef } from 'react'

// Тело поста/страницы. HTML рендерится на сервере как есть; на клиенте оживляем
// аккордеоны Advanced Gutenberg (на WP это делает jQuery UI в advaccordion/frontend.js).
export function EntryContent({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const controller = new AbortController()
    root
      .querySelectorAll<HTMLElement>('.advgb-accordion-wrapper')
      .forEach((wrapper) => initAccordion(wrapper, controller.signal))

    return () => controller.abort()
  }, [html])

  return <article ref={ref} className="entry-content" dangerouslySetInnerHTML={{ __html: html }} />
}

function initAccordion(wrapper: HTMLElement, signal: AbortSignal) {
  const headers = Array.from(
    wrapper.querySelectorAll<HTMLElement>(
      ':scope > .advgb-accordion-item > .advgb-accordion-header',
    ),
  )
  // data-expand-all: все открыты и переключаются независимо; иначе открыт максимум один
  const expandAll = wrapper.dataset.expandAll === 'true'
  const collapsed = wrapper.dataset.collapsed === 'true'

  const setOpen = (header: HTMLElement, open: boolean) =>
    header.setAttribute('aria-expanded', String(open))

  const toggle = (header: HTMLElement) => {
    const open = header.getAttribute('aria-expanded') === 'true'
    if (!open && !expandAll) headers.forEach((other) => other !== header && setOpen(other, false))
    setOpen(header, !open)
  }

  headers.forEach((header, i) => {
    header.tabIndex = 0
    header.setAttribute('role', 'button')
    setOpen(header, expandAll || (!collapsed && i === 0))

    header.addEventListener('click', () => toggle(header), { signal })
    header.addEventListener(
      'keydown',
      (e) => {
        const focus = (index: number) => headers[(index + headers.length) % headers.length].focus()
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault()
            toggle(header)
            break
          case 'ArrowDown':
            e.preventDefault()
            focus(i + 1)
            break
          case 'ArrowUp':
            e.preventDefault()
            focus(i - 1)
            break
          case 'Home':
            e.preventDefault()
            focus(0)
            break
          case 'End':
            e.preventDefault()
            focus(headers.length - 1)
            break
        }
      },
      { signal },
    )
  })
}

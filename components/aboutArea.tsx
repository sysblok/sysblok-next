'use client'

import { usePathname } from 'next/navigation'

const HOME_PHRASE = 'Журнал о цифровых технологиях в культуре, искусстве и образовании'

export function AboutArea({ html, className }: { html: string; className?: string }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const finalHtml = isHome
    ? html.replace(/<\/h4>/i, `</h4><p class="mb-4">${HOME_PHRASE}</p>`)
    : html

  return <div className={className} dangerouslySetInnerHTML={{ __html: finalHtml }} />
}

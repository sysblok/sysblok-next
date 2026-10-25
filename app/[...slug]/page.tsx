import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPageBySlug, getPostAcf } from '@/lib/wordpress'
import type { Page, Post } from '@/lib/wordpress.d'
import { postHref } from '@/lib/utils'
import { siteConfig } from '@/site.config'
import PostEntry from '@/app/(entry)/components/post-entry'
import PageEntry from '@/app/(entry)/components/page-entry'

type Params = Promise<{ slug: string[] }>

type Entry = { kind: 'post'; post: Post } | { kind: 'page'; page: Page }

// Пост или страница по последнему сегменту пути (как WordPress: /<рубрика>/<slug>, /<slug>).
// Запросы кэшируются fetch'ем, поэтому повторный вызов из generateMetadata бесплатный.
async function resolveEntry(slug: string[]): Promise<Entry | null> {
  const lastSlug = slug[slug.length - 1]

  const post = await getPostBySlug(lastSlug)
  if (post) return { kind: 'post', post }

  const page = await getPageBySlug(lastSlug)
  if (page) return { kind: 'page', page }

  return null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const entry = await resolveEntry((await params).slug)
  if (!entry) return {}

  const item = entry.kind === 'post' ? entry.post : entry.page
  const { title, excerpt: description } = item
  const url = `${siteConfig.site_domain}${postHref(item)}`

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`)
  ogUrl.searchParams.append('title', title)
  ogUrl.searchParams.append('description', description)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: entry.kind === 'post' ? 'article' : 'website',
      url,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl.toString()],
    },
  }
}

export default async function CatchAllPage({ params }: { params: Params }) {
  const entry = await resolveEntry((await params).slug)
  if (!entry) notFound()

  if (entry.kind === 'post') {
    const acf = await getPostAcf(entry.post.id, ['creators', 'editors_note'])
    return <PostEntry post={entry.post} acf={acf} />
  }

  const acf = await getPostAcf(entry.page.id, ['creators'])
  return <PageEntry page={entry.page} acf={acf} />
}

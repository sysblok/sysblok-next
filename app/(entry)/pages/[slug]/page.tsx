import { getPageBySlug, getAllPages, getPostAcf } from '@/lib/wordpress'
import { siteConfig } from '@/site.config'
import { PostCreators } from '../../components/creators'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Revalidate pages every hour
export const revalidate = 3600

export async function generateStaticParams() {
  return getAllPages({ _fields: ['slug'] })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    return {}
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`)
  const { title } = page
  ogUrl.searchParams.append('title', title)
  // Strip HTML tags for description and limit length
  const description =
    page.excerpt ||
    page.content
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 200) + '...'
  ogUrl.searchParams.append('description', description)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteConfig.site_domain}/pages/${page.slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description,
      images: [ogUrl.toString()],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) notFound()

  const acf = await getPostAcf(page.id, ['creators'])

  return (
    <div className="entry-page entry-full">
      {/* Header zone — title + optional image */}
      <div className="entry-header-col upper-elements-col">
        <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: page.title }} />

        {page.featuredMedia?.sourceUrl && (
          <div className="entry-thumb">
            {/* eslint-disable-next-line */}
            <img
              src={page.featuredMedia.sourceUrl}
              alt={page.featuredMedia.altText || page.title || 'Page image'}
            />
            {page.featuredMedia.caption && (
              <div
                className="entry-thumb-caption"
                dangerouslySetInnerHTML={{ __html: page.featuredMedia.caption }}
              />
            )}
          </div>
        )}
      </div>

      {/* Content zone */}
      <div className="entry-content-col upper-elements-col">
        <article className="entry-content" dangerouslySetInnerHTML={{ __html: page.content }} />

        {acf.creators && <PostCreators creators={acf.creators} />}
      </div>
    </div>
  )
}

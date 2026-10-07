import { getPostBySlug, getAllPostSlugs, getPostData } from '@/lib/wordpress'
import { siteConfig } from '@/site.config'
import { PostCreators } from '../../components/creators'

import Link from 'next/link'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllPostSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {}
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`)
  const { title } = post
  ogUrl.searchParams.append('title', title)
  // Strip HTML tags for description
  const description = post.excerpt
  ogUrl.searchParams.append('description', description)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteConfig.site_domain}/posts/${post.slug}`,
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

  const postData = await getPostData(slug)

  if (!postData) notFound()

  const { post, featuredMedia, category, acf } = postData

  const date = post.date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="entry-full">
      {/* Header zone — meta, title, lead, image */}
      <div className="entry-header-col upper-elements-col">
        <div className="post-header">
          <div className="post-meta-and-title">
            <div className="entry-meta">
              <span className="entry-cats">
                <Link href={`/posts/?category=${category.id}`}>{category.name}</Link>
              </span>
              <time className="entry-date">{date}</time>
            </div>

            <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: post.title }} />

            {post.excerpt && <p className="entry-lead">{post.excerpt}</p>}

            {acf.editors_note && (
              <p
                className="entry-lead entry-editors-note"
                dangerouslySetInnerHTML={{ __html: acf.editors_note }}
              />
            )}
          </div>

          {featuredMedia?.sourceUrl && (
            <div className="entry-thumb">
              {/* eslint-disable-next-line */}
              <img
                src={featuredMedia.sourceUrl}
                alt={featuredMedia.altText || post.title || 'Post thumbnail'}
              />
              {featuredMedia.caption && (
                <div
                  className="entry-thumb-caption"
                  dangerouslySetInnerHTML={{ __html: featuredMedia.caption }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content zone — article body + tags */}
      <div className="entry-content-col upper-elements-col">
        <article className="entry-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {acf.creators && <PostCreators creators={acf.creators} />}

        {post.tags.length > 0 && (
          <div className="entry-tags">
            <p>
              Теги:
              {post.tags.map((tag, i) => (
                <span key={tag.id}>
                  <Link href={`/posts/?tag=${tag.id}`}>{tag.name}</Link>
                  {i < post.tags.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

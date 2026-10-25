import Image from 'next/image'
import Link from 'next/link'

import { formatPostDate, postHref, truncateWords } from '@/lib/utils'
import type { CardPost } from '@/lib/wordpress'
import { CategoryLinks } from './category-links'

import './post-card.css'

// Большая карточка закреплённого поста: текст слева, фото справа
export function FeaturedPostCard({ post }: { post: CardPost }) {
  const media = post.featuredMedia
  const href = postHref(post)
  const authors =
    post.coauthors.length > 0
      ? post.coauthors
      : post.author
        ? [{ id: post.author.id, name: post.author.name, slug: post.author.slug }]
        : []

  return (
    <div className="post-card big group not-prose flex flex-col overflow-hidden md:flex-row md:items-center">
      {/* Текстовая часть по центру, как .big-latest-textual-side на WP */}
      <div className="flex flex-col justify-center gap-4 p-8 md:w-[45%] text-center">
        <div className="entry-meta">
          <CategoryLinks categories={post.categories} />
          <time className="entry-date" dateTime={post.date.toISOString()}>
            {formatPostDate(post.date)}
          </time>
        </div>

        <Link href={href}>
          <div
            dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }}
            className="entry-title"
          />
        </Link>

        {post.excerpt && <p className="entry-excerpt__sticky">{truncateWords(post.excerpt, 63)}</p>}

        {/* Все соавторы через запятую (coauthors_posts_links на WP) */}
        {authors.length > 0 && (
          <div className="more-link-holder">
            <div className="more-link">
              <div className="more-link-span">
                {authors.map((a, i) => (
                  <span key={a.id ?? a.slug}>
                    {i > 0 && ', '}
                    <Link
                      href={`/author/${a.slug}`}
                      title={`Записи автора ${a.name}`}
                      rel="author"
                      className="author url fn"
                    >
                      {a.name}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {media?.sourceUrl && (
        <Link
          href={href}
          className="post-card-img relative block w-full aspect-[3/2] overflow-hidden bg-white md:w-[75%] md:aspect-[3/2]"
        >
          <Image
            src={media.sourceUrl}
            alt={media.altText || post.title || 'Post thumbnail'}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 55vw, 100vw"
            priority
          />
        </Link>
      )}
    </div>
  )
}

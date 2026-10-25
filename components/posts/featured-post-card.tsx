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
  const author = post.author

  return (
    <div className="post-card big group not-prose flex flex-col overflow-hidden rounded-lg md:flex-row md:items-center">
      <div className="flex flex-col justify-center gap-4 p-8 md:w-[45%] text-left">
        <div className="entry-meta flex justify-start gap-2">
          <CategoryLinks categories={'categories' in post ? post.categories : undefined} />
          <time dateTime={post.date.toISOString()}>{formatPostDate(post.date)}</time>
        </div>

        <Link href={href}>
          <div
            dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }}
            className="entry-title"
          />
        </Link>

        {post.excerpt && <p className="entry-excerpt__sticky">{truncateWords(post.excerpt, 63)}</p>}

        {author && (
          <div className="more-link-holder">
            <div className="more-link">
              <div className="more-link-span author-link-span">
                <Link
                  href={`/author/${author.slug}`}
                  title={`Записи автора ${author.name}`}
                  rel="author"
                  className="author url fn"
                >
                  {author.name}
                </Link>
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

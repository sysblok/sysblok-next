import Image from 'next/image'
import Link from 'next/link'

import { formatPostDate, postHref, truncateWords } from '@/lib/utils'
import type { CardPost } from '@/lib/wordpress'
import { CategoryLinks } from './category-links'

import './post-card.css'

// Карточка поста для сеток и списков. Имена соавторов нужно заранее
// подставить через resolveCoauthorNames, иначе выведутся логины.
export function PostCard({ post }: { post: CardPost }) {
  const media = post.featuredMedia
  const href = postHref(post)

  const authors =
    post.coauthors.length > 0
      ? post.coauthors
      : post.author
        ? [{ id: post.author.id, name: post.author.name, slug: post.author.slug }]
        : []

  return (
    <div className="post-card small relative rounded-lg group flex justify-between flex-col not-prose gap-8">
      <div className="flex flex-col gap-4">
        {media?.sourceUrl && (
          <Link
            href={href}
            aria-label={post.title || 'Открыть пост'}
            className="post-card-img relative z-10 block w-full overflow-hidden rounded-md border bg-white"
          >
            <Image
              className="h-full w-full object-cover"
              src={media.sourceUrl}
              alt={media.altText || post.title || 'Post thumbnail'}
              width={412}
              height={216}
            />
          </Link>
        )}

        <div className="entry-meta flex justify-start gap-2 text-sm p-[10px]">
          <CategoryLinks categories={post.categories} />
          <time dateTime={post.date.toISOString()}>{formatPostDate(post.date)}</time>
        </div>

        <h2 className="blog-entry__title p-[10px]">
          <Link
            href={href}
            className="blog-entry__title"
            dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }}
          />
        </h2>

        <div className="entry-excerpt author-block__description p-[10px]">
          {post.excerpt ? truncateWords(post.excerpt, 50) + '...' : 'No excerpt available'}
        </div>
      </div>

      {authors.length > 0 && (
        <div className="entry-authors text-sm p-[10px]">
          {authors.map((a, i) => (
            <span key={a.id ?? a.slug}>
              {i > 0 && ', '}
              <Link
                href={`/author/${a.slug}`}
                rel="author"
                className="relative z-10 hover:underline"
              >
                {a.name}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

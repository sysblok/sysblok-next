import Image from 'next/image'
import Link from 'next/link'

import { formatPostDate, postHref } from '@/lib/utils'
import type { CardPost } from '@/lib/wordpress'
import { CategoryLinks } from './category-links'

import './post-card.css'

// Размер картинки карточки в WordPress (412×216)
const CARD_IMAGE_SIZE = 'mauer_narrator_article_card'

interface PostCardProps {
  post: CardPost
  /** Показывать рубрики над заголовком (в секциях «Проекты», «Дата-истории» на WP их нет) */
  showCategories?: boolean
}

// Карточка поста для сеток и списков, как компонент article темы WordPress.
// Имена соавторов нужно заранее подставить через resolveCoauthorNames, иначе выведутся логины.
export function PostCard({ post, showCategories = true }: PostCardProps) {
  const media = post.featuredMedia
  const image = media?.mediaDetails?.sizes?.[CARD_IMAGE_SIZE]
  const href = postHref(post)

  const authors =
    post.coauthors.length > 0
      ? post.coauthors
      : post.author
        ? [{ id: post.author.id, name: post.author.name, slug: post.author.slug }]
        : []

  return (
    <div className="article post-card small">
      {media?.sourceUrl && (
        <Link href={href} className="entry-thumb-link" aria-label={post.title || 'Открыть пост'}>
          <Image
            src={image?.source_url ?? media.sourceUrl}
            alt={media.altText || post.title || 'Post thumbnail'}
            width={image?.width ?? 412}
            height={image?.height ?? 216}
          />
          <div className="entry-thumb-overlay" />
        </Link>
      )}

      <div className="entry-meta">
        {showCategories && <CategoryLinks categories={post.categories} />}
        <time className="entry-date" dateTime={post.date.toISOString()}>
          {formatPostDate(post.date)}
        </time>
      </div>

      <h2 className="entry-title">
        <Link href={href} dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }} />
      </h2>

      {/* Подпись авторов идёт сразу после подводки, как на WP */}
      <div className="entry-excerpt">
        {post.excerpt && <p>{post.excerpt}</p>}
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
                      className="author url fn"
                      rel="author"
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
    </div>
  )
}

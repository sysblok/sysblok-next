import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { CardPost } from '@/lib/wordpress'

interface PostCardProps {
  post: CardPost
  showAuthor?: boolean
  /** Большая "геройская" карточка для закреплённого/главного поста */
  featured?: boolean
}

export function PostCard({ post, showAuthor = false, featured = false }: PostCardProps) {
  const media = post.featuredMedia
  const date = post.date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const categories = 'categories' in post ? post.categories : undefined
  const category = categories?.[0]
  const author = post.author
  // acf.photo — url фото автора (блог-тема хранит его в ACF, не в avatar_urls).
  // Если фото ещё не резолвнуто в url (пришёл id) или его нет совсем, авторского фото не показываем.
  const authorPhoto = typeof author?.acf?.photo === 'string' ? author.acf.photo : undefined

  const href = 'categories' in post ? `/posts/${post.slug}` : `/pages/${post.slug}`

  // ------------------------------------------------------------------
  // Featured / sticky-post вариант — широкий блок: текст слева, фото справа
  // ------------------------------------------------------------------
  if (featured) {
    return (
      <div
        className={cn(
          'post-card big',
          'group not-prose flex flex-col overflow-hidden rounded-lg bg-accent/30',
          'md:flex-row md:items-center',
          'hover:bg-accent/50 transition-all',
        )}
      >
        {/* Текстовая часть */}
        <div className="flex flex-col justify-center gap-4 p-8 md:w-[45%] text-left">
          <div className="entry-meta flex justify-start gap-2">
            {categories && categories.length > 0 && (
              <span className="entry-cats">
                {categories.map((cat, i) => (
                  <span key={cat.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/posts?category=${cat.slug}`}
                      rel="category tag"
                      className="hover:underline transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </span>
                ))}
              </span>
            )}
            <span>—</span>
            <time dateTime={post.date.toISOString()}>{date}</time>
          </div>

          <Link href={href}>
            <div
              dangerouslySetInnerHTML={{
                __html: post.title || 'Untitled Post',
              }}
              className="entry-title"
            />
          </Link>

          {post.excerpt && (
            <p className="entry-excerpt">{post.excerpt.split(' ').slice(0, 63).join(' ').trim()}</p>
          )}

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

        {/* Фото — растянуто на всю оставшуюся ширину/высоту блока */}
        {media?.sourceUrl && (
          <Link
            href={href}
            className="relative block w-full aspect-[3/2] md:w-[75%] md:aspect-[3/2]"
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

  // ------------------------------------------------------------------
  // Обычная карточка (как было) — используется в сетках/списках постов
  // ------------------------------------------------------------------
  return (
    <Link
      href={href}
      className={cn(
        !showAuthor && 'post-card small',
        'border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-8',
        'hover:bg-accent/75 transition-all',
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Блок автора */}
        {showAuthor && author && (
          <div className="flex items-start gap-3 pb-4 border-b">
            {authorPhoto && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={authorPhoto}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{author.name}</h3>
              {author.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{author.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Мета-информация (для блогов - вместо изображения) */}
        {showAuthor && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="text-blue-600">{category?.name || 'блог'}</span>
            <span>—</span>
            <span>{date}</span>
          </div>
        )}

        {/* Изображение поста (только для обычных карточек) */}
        {!showAuthor && media?.sourceUrl && (
          <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
            <Image
              className="h-full w-full object-cover"
              src={media.sourceUrl}
              alt={media.altText || post.title || 'Post thumbnail'}
              width={400}
              height={200}
            />
          </div>
        )}

        {/* Заголовок */}
        <div
          dangerouslySetInnerHTML={{
            __html: post.title || 'Untitled Post',
          }}
          className={cn(
            'text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all',
            showAuthor ? 'text-lg line-clamp-3' : 'text-xl',
          )}
        />

        {/* Превью текста */}
        <div className={cn(!showAuthor && 'entry-excerpt', 'text-sm text-muted-foreground')}>
          {post.excerpt
            ? post.excerpt
                .split(' ')
                .slice(0, showAuthor ? 30 : 24)
                .join(' ')
                .trim() + '...'
            : 'No excerpt available'}
        </div>
      </div>

      {/* Футер карточки (только для обычных постов) */}
      {!showAuthor && (
        <div className="flex flex-col gap-4">
          <hr />
          <div className="flex justify-between items-center text-xs">
            <p>{category?.name || 'Uncategorized'}</p>
            <p>{date}</p>
          </div>
        </div>
      )}
    </Link>
  )
}

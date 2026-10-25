import Image from 'next/image'
import Link from 'next/link'

import { formatPostDate, postHref, truncateWords } from '@/lib/utils'
import type { CardPost } from '@/lib/wordpress'
import type { Category } from '@/lib/wordpress.d'

interface BlogPostCardProps {
  post: CardPost
  /** Рубрика блога, в которой вышла запись («Блог Дмитрия Пронина») */
  blog: Category
  /** Готовый url фото автора (или плейсхолдер) */
  authorPhoto: string
}

// Карточка записи из авторского блога: вместо обложки — блок автора
export function BlogPostCard({ post, blog, authorPhoto }: BlogPostCardProps) {
  const author = post.author

  return (
    <div className="relative rounded-lg group flex justify-between flex-col not-prose gap-8 p-[10px]">
      <div className="flex flex-col gap-4">
        {author && (
          <Link
            href={`/author/${author.slug}`}
            title={`Записи автора ${author.name}`}
            rel="author"
            className="author-block flex gap-3 pb-4 relative z-10 p-[10px]"
          >
            <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={authorPhoto}
                alt={author.name}
                width={64}
                height={64}
                style={{ width: 64, height: 64 }}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 line-clamp-4">
              <h2 className="author-block__name">{author.name}</h2>
              {author.description && (
                <p className="author-block__description">{author.description}</p>
              )}
            </div>
          </Link>
        )}

        <div className="entry-meta">
          <Link href={`/posts?category=${blog.slug}`} className="relative z-10 entry-cats p-[10px]">
            {blog.name}
          </Link>
          <span className="entry-date">{formatPostDate(post.date)}</span>
        </div>

        <h2 className="blog-entry__title p-[10px]">
          <Link
            href={postHref(post)}
            className="blog-entry__title"
            dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }}
          />
        </h2>

        <div className="author-block__description p-[10px]">
          {post.excerpt ? truncateWords(post.excerpt, 40) + '...' : 'No excerpt available'}
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

import { formatPostDate, postHref, shortenDescription } from '@/lib/utils'
import type { CardPost } from '@/lib/wordpress'
import type { Category } from '@/lib/wordpress.d'

import './post-card.css'

interface BlogPostCardProps {
  post: CardPost
  /** Рубрика блога, в которой вышла запись («Блог Дмитрия Пронина») */
  blog: Category
  /** Готовый url фото автора (или плейсхолдер) */
  authorPhoto: string
}

// Карточка записи из авторского блога (WP components/blog-preview-card + author-block с is_blog)
export function BlogPostCard({ post, blog, authorPhoto }: BlogPostCardProps) {
  const author = post.author
  const href = postHref(post)

  return (
    <div className="blog post-card small">
      {author && (
        <Link className="author-block" href={`/author/${author.slug}`}>
          <div className="author-block__photo-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="author-block__photo"
              src={authorPhoto}
              width={150}
              height={150}
              alt="Фото автора"
            />
          </div>
          <div className="author-block__text-content">
            <h2 className="author-block__name">{author.name}</h2>
            {author.description && (
              <p className="author-block__description">
                {shortenDescription(author.description, 65)}
              </p>
            )}
          </div>
        </Link>
      )}

      <div className="entry-meta blog__entry-meta">
        <span className="entry-cats">
          <Link href={`/posts?category=${blog.slug}`}>{blog.name}</Link>
        </span>
        <span className="entry-date">{formatPostDate(post.date)}</span>
      </div>

      <h2 className="entry-title">
        <Link href={href} dangerouslySetInnerHTML={{ __html: post.title || 'Untitled Post' }} />
      </h2>

      {post.excerpt && <div className="entry-excerpt">{post.excerpt}</div>}
    </div>
  )
}

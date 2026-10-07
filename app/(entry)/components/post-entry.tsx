import Link from 'next/link'
import type { Post, Media, Category, PostAcf } from '@/lib/wordpress.d'
import { PostCreators } from './creators'
import { Sharing } from './sharing'

interface PostEntryProps {
  post: Post
  featuredMedia?: Media
  category: Category
  acf: PostAcf
}

export function PostEntry({ post, featuredMedia, category, acf }: PostEntryProps) {
  const date = post.date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="section-main-content">
      <div className="container-fluid container-fluid-with-max-width">
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

          {/* Content zone — article body + sharing + creators + tags */}
          <div className="entry-content-col upper-elements-col">
            <article className="entry-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            <Sharing title={post.title} slug={post.slug} />

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
      </div>
    </section>
  )
}

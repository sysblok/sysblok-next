import Link from 'next/link'
import type { Post, PostAcf } from '@/lib/wordpress.d'
import { PostCreators } from './creators'
import { Sharing } from './sharing'

interface PostEntryProps {
  post: Post
  acf: PostAcf
}

export function PostEntry({ post, acf }: PostEntryProps) {
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
                    {post.categories.map((cat, i) => (
                      <span key={cat.id}>
                        <Link href={`/posts/?category=${cat.id}`}>{cat.name}</Link>
                        {i < post.categories.length - 1 ? ', ' : ''}
                      </span>
                    ))}
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

              {post.featuredMedia?.sourceUrl && (
                <div className="entry-thumb">
                  {/* TODO: replace <img> with next/image <Image> for optimization */}
                  {/* eslint-disable-next-line */}
                  <img
                    src={post.featuredMedia.sourceUrl}
                    alt={post.featuredMedia.altText || post.title || 'Post thumbnail'}
                  />
                  {post.featuredMedia.caption && (
                    <div
                      className="entry-thumb-caption"
                      dangerouslySetInnerHTML={{ __html: post.featuredMedia.caption }}
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
          {/* TODO: add Related Posts */}
        </div>
      </div>
    </section>
  )
}

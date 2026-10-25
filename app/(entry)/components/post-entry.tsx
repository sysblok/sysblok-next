import '../entry.css'
import React from 'react'
import Link from 'next/link'
import type { Post, PostAcf } from '@/lib/wordpress.d'
import { formatPostDate, postHref } from '@/lib/utils'
import { siteConfig } from '@/site.config'
import { EntryCreators } from './creators'
import { EntryImage } from './entry-image'
import { WordPressStyles } from './wordpress-styles'
import { Sharing } from './sharing'
import { TelegramButton } from './telegram-button'

interface PostEntryProps {
  post: Post
  acf: PostAcf
}

export default function PostEntry({ post, acf }: PostEntryProps) {
  return (
    <section className="section-main-content">
      <WordPressStyles />
      <div className="container-fluid container-fluid-with-max-width">
        <TelegramButton utmContent="tg_button_single_post" />
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
                  <time className="entry-date" dateTime={post.date.toISOString()}>
                    {formatPostDate(post.date)}
                  </time>
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
                <EntryImage
                  media={post.featuredMedia}
                  alt={post.featuredMedia.altText || post.title || 'Post thumbnail'}
                />
              )}
            </div>
          </div>

          {/* Content zone — article body + creators + tags + sharing */}
          <div className="entry-content-col upper-elements-col">
            <article className="entry-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            <EntryCreators creators={acf.creators} />

            {post.tags.length > 0 && (
              <div className="entry-tags">
                <p>
                  Теги:
                  {post.tags.map((tag, i) => (
                    <React.Fragment key={tag.id}>
                      <Link href={`/posts/?tag=${tag.id}`}>{tag.name}</Link>
                      {i < post.tags.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            )}

            <Sharing title={post.title} url={`${siteConfig.site_domain}${postHref(post)}`} />
          </div>
          {/* TODO: add Related Posts */}
        </div>
      </div>
    </section>
  )
}

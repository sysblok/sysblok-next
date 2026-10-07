import type { Page, PostAcf } from '@/lib/wordpress.d'
import { PostCreators } from './creators'

interface PageEntryProps {
  page: Page
  acf: PostAcf
}

export function PageEntry({ page, acf }: PageEntryProps) {
  return (
    <section className="section-main-content">
      <div className="container-fluid container-fluid-with-max-width">
        <div className="entry-page entry-full">
          {/* Header zone — title + optional image */}
          <div className="entry-header-col upper-elements-col">
            <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: page.title }} />

            {page.featuredMedia?.sourceUrl && (
              <div className="entry-thumb">
                {/* TODO: replace <img> with next/image <Image> for optimization */}
                {/* eslint-disable-next-line */}
                <img
                  src={page.featuredMedia.sourceUrl}
                  alt={page.featuredMedia.altText || page.title || 'Page image'}
                />
                {page.featuredMedia.caption && (
                  <div
                    className="entry-thumb-caption"
                    dangerouslySetInnerHTML={{ __html: page.featuredMedia.caption }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Content zone */}
          <div className="entry-content-col upper-elements-col">
            <article className="entry-content" dangerouslySetInnerHTML={{ __html: page.content }} />

            {acf.creators && <PostCreators creators={acf.creators} />}
          </div>
        </div>
      </div>
    </section>
  )
}

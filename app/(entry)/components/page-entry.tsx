import '../entry.css'
import type { Page, PostAcf } from '@/lib/wordpress.d'
import { EntryCreators } from './creators'
import { EntryImage } from './entry-image'

interface PageEntryProps {
  page: Page
  acf: PostAcf
}

export default function PageEntry({ page, acf }: PageEntryProps) {
  return (
    <section className="section-main-content">
      <div className="container-fluid container-fluid-with-max-width">
        <div className="entry-page entry-full">
          {/* Header zone — title + optional image */}
          <div className="entry-header-col upper-elements-col">
            <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: page.title }} />

            {page.featuredMedia?.sourceUrl && (
              <EntryImage
                media={page.featuredMedia}
                alt={page.featuredMedia.altText || page.title || 'Page image'}
              />
            )}
          </div>

          {/* Content zone */}
          <div className="entry-content-col upper-elements-col">
            <article className="entry-content" dangerouslySetInnerHTML={{ __html: page.content }} />

            <EntryCreators creators={acf.creators} />
          </div>
        </div>
      </div>
    </section>
  )
}

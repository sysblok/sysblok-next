import type { Media } from '@/lib/wordpress.d'

const PREFERRED_SIZE = 'mauer_narrator_inside_article_picture'

interface EntryImageProps {
  media: Media
  alt: string
}

export function EntryImage({ media, alt }: EntryImageProps) {
  const preferred = media.mediaDetails.sizes[PREFERRED_SIZE]
  const src = preferred?.source_url || media.sourceUrl

  const srcSet = Object.values(media.mediaDetails.sizes)
    .map((size) => `${size.source_url} ${size.width}w`)
    .join(', ')

  return (
    <div className="entry-thumb">
      {/* Custom srcset matching WP image sizes — not using next/image intentionally */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 856px) 100vw, 856px"
        width={preferred?.width || media.mediaDetails.width}
        height={preferred?.height || media.mediaDetails.height}
        alt={alt}
      />
      {media.caption && (
        <div className="entry-thumb-caption" dangerouslySetInnerHTML={{ __html: media.caption }} />
      )}
    </div>
  )
}

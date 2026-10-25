import type { Media } from '@/lib/wordpress.d'

const PREFERRED_SIZE = 'mauer_narrator_inside_article_picture'
// WordPress max_srcset_image_width
const MAX_SRCSET_WIDTH = 2048

interface ImageSize {
  source_url: string
  width: number
  height: number
}

// wp_image_matches_ratio: уменьшаем большую картинку до ширины меньшей и сравниваем высоты (±1px)
function matchesRatio(a: ImageSize, b: ImageSize): boolean {
  const [big, small] = a.width > b.width ? [a, b] : [b, a]
  const scaledHeight = Math.round((big.height * small.width) / big.width)
  return Math.abs(scaledHeight - small.height) <= 1
}

// Как wp_calculate_image_srcset: только размеры с теми же пропорциями, что и основной,
// иначе браузер может выбрать квадратную миниатюру или другой кроп.
function buildSrcSet(main: ImageSize, candidates: ImageSize[]): string {
  const seen = new Set<number>()

  return candidates
    .filter((size) => size.width <= MAX_SRCSET_WIDTH && matchesRatio(main, size))
    .sort((a, b) => a.width - b.width)
    .filter((size) => !seen.has(size.width) && seen.add(size.width))
    .map((size) => `${size.source_url} ${size.width}w`)
    .join(', ')
}

interface EntryImageProps {
  media: Media
  alt: string
}

export function EntryImage({ media, alt }: EntryImageProps) {
  const { mediaDetails } = media
  const full: ImageSize = {
    source_url: media.sourceUrl,
    width: mediaDetails.width,
    height: mediaDetails.height,
  }
  const main: ImageSize = mediaDetails.sizes[PREFERRED_SIZE] ?? full
  const srcSet = buildSrcSet(main, [...Object.values(mediaDetails.sizes), full])

  return (
    <div className="entry-thumb">
      {/* Custom srcset matching WP image sizes — not using next/image intentionally */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={main.source_url}
        srcSet={srcSet || undefined}
        sizes="(max-width: 856px) 100vw, 856px"
        width={main.width}
        height={main.height}
        alt={alt}
      />
      {media.caption && (
        <div className="entry-thumb-caption" dangerouslySetInnerHTML={{ __html: media.caption }} />
      )}
    </div>
  )
}

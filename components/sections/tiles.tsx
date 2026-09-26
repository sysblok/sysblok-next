import { getCategoryBySlug, getPostsPaginated } from '@/lib/wordpress'
import type { CardPost } from '@/lib/wordpress'
import Image from 'next/image'
import Link from 'next/link'

// Подпись плитки совпадает с названием рубрики
const TILES = [
  { slug: 'infographics', label: 'Инфографика' },
  { slug: 'test', label: 'Тест' },
  { slug: 'glossary', label: 'Глоссарий' },
] as const

const tileHref = (post: CardPost) => `/posts/${post.slug}`

// Последняя запись рубрики. Если рубрики нет, возвращаем null, а не любой пост:
// иначе фильтр по рубрике не применится
async function getLatestPost(slug: string): Promise<CardPost | null> {
  const category = await getCategoryBySlug(slug)
  if (!category) return null

  const { data } = await getPostsPaginated(1, 1, { categories: category.id })
  return data[0] ?? null
}

export async function Tiles() {
  const tiles = (
    await Promise.all(
      TILES.map(async ({ slug, label }) => {
        const post = await getLatestPost(slug)
        return post ? [{ label, post }] : []
      }),
    )
  ).flat()

  if (tiles.length === 0) return null

  return (
    <section className="mb-12">
      <div className="grid sm:grid-cols-3 gap-6">
        {tiles.map(({ label, post }) => (
          <Link key={label} href={tileHref(post)} className="group block text-center">
            {post.featuredMedia ? (
              <Image
                src={post.featuredMedia.sourceUrl}
                alt={post.featuredMedia.altText || post.title}
                width={412}
                height={412}
                className="w-full h-auto aspect-square object-cover"
              />
            ) : (
              <div className="aspect-square bg-accent/25 flex items-center justify-center p-4">
                {post.title}
              </div>
            )}
            <span className="mt-3 block font-serif text-lg group-hover:underline">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

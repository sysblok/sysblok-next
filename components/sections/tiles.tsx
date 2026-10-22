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

// Последняя запись рубрики по её slug.
// Если рубрики нет, возвращаем null, а не любой пост:
// иначе фильтр по рубрике не применится.
async function getLatestCategoryPost(categorySlug: string): Promise<CardPost | null> {
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return null

  const { data } = await getPostsPaginated(1, 1, {
    categories: category.id,
  })

  return data[0] ?? null
}

export async function Tiles() {
  const tiles = (
    await Promise.all(
      TILES.map(async ({ slug: categorySlug, label }) => {
        const post = await getLatestCategoryPost(categorySlug)
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
              <div className="overflow-hidden bg-white">
                <Image
                  src={post.featuredMedia.sourceUrl}
                  alt={post.featuredMedia.altText || post.title}
                  width={412}
                  height={412}
                  className="w-full h-auto aspect-square object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </div>
            ) : (
              <div className="aspect-square bg-accent/25 flex items-center justify-center p-4 transition-opacity duration-300 group-hover:opacity-80">
                {post.title}
              </div>
            )}
            <h3 className="mt-3 block font-serif text-[#141414]">{label}</h3>
          </Link>
        ))}
      </div>
    </section>
  )
}

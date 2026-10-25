// components/category-section.tsx
import { getCategoryBySlug, getPagesByCategory, resolveCoauthorNames } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

type CategorySectionProps = {
  slug: string
  title: string
  moreLabel?: string
  limit?: number
}

export async function CategorySection({
  slug,
  title,
  moreLabel = 'Больше',
  limit = 3,
}: CategorySectionProps) {
  const category = await getCategoryBySlug(slug)

  // Если рубрика не найдена, блок не показываем: иначе фильтр по рубрике
  // не применится и вместо нужных материалов придут любые страницы
  if (!category) return null

  const items = await resolveCoauthorNames(await getPagesByCategory(category.id, limit))

  if (items.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-6">{title}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <PostCard key={item.id} post={item} />
        ))}
      </div>
      <div className="mt-6 text-right">
        <Link href={`/posts?category=${category.id}`}>{moreLabel} →</Link>
      </div>
    </section>
  )
}

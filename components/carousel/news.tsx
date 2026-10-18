import { getCategoryBySlug, getPostsPaginated } from '@/lib/wordpress'

import { NewsCarousel } from './news-carousel'

interface NewsProps {
  categoryId?: number
  categorySlug?: string
  limit?: number
  className?: string
  title?: string
}

export async function News({
  categoryId,
  categorySlug = 'news',
  limit = 10,
  className,
  title = 'Новости',
}: NewsProps) {
  const newsCategoryId = categoryId || (await getCategoryBySlug(categorySlug)).id

  const { data: newsPosts } = await getPostsPaginated(1, limit, {
    categories: newsCategoryId,
  })

  const items = newsPosts.map((post) => ({
    id: post.id,
    url: `/posts/${post.slug}`,
    title: post.title || 'Untitled Post',
    description: post.excerpt || '',
    date: post.date.toLocaleDateString('ru-RU'), // 29.09.2026
    dateISO: post.date.toISOString(),
  }))

  if (items.length === 0) {
    return null
  }

  return (
    <section className={['news-slider', className].filter(Boolean).join(' ')}>
      <h2 className="news-slider__heading">{title}</h2>
      <NewsCarousel items={items} />
    </section>
  )
}

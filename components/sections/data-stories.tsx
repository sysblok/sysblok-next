import { getCategoryBySlug, getPagesByCategory } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

export async function DataStories() {
  const dataStoriesCategory = await getCategoryBySlug('data-istorii')

  // Если рубрика не найдена, блок не показываем: иначе фильтр по рубрике
  // не применится и вместо дата-историй придут любые страницы
  if (!dataStoriesCategory) return null

  const stories = await getPagesByCategory(dataStoriesCategory.id, 3)

  if (stories.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-6">Дата-истории</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((story) => (
          <PostCard key={story.id} post={story} />
        ))}
      </div>
      <div className="mt-6 text-right">
        <Link
          href={`/posts?category=${dataStoriesCategory.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Больше дата-историй →
        </Link>
      </div>
    </section>
  )
}

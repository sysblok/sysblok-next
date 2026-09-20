import { getCategoryBySlug, getPagesByCategory } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

export async function Projects() {
  const projectsCategory = await getCategoryBySlug('portaly')

  // Если рубрика не найдена, блок не показываем: иначе фильтр по рубрике
  // не применится и вместо проектов придут любые страницы
  if (!projectsCategory) return null

  // Проекты на проде — это страницы (pages), а не записи
  const projects = await getPagesByCategory(projectsCategory.id, 3)

  if (projects.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-6">Проекты</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <PostCard key={project.id} post={project} showAuthor />
        ))}
      </div>
      <div className="mt-6 text-right">
        <Link
          href={`/posts?category=${projectsCategory.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Больше проектов →
        </Link>
      </div>
    </section>
  )
}

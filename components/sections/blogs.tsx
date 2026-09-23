import { getCategoryBySlug, getChildCategories, getPostsPaginated } from '@/lib/wordpress'
import type { CardPost } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

export async function Blogs() {
  const blogCategory = await getCategoryBySlug('blog')

  if (!blogCategory) return null

  const children = await getChildCategories(blogCategory.id)
  const childIds = new Set(children.map(({ id }) => id))

  // 3 последние записи из всех блогов, как на проде
  const { data } = await getPostsPaginated(1, 3, {
    categories: [blogCategory.id, ...childIds],
  })

  const posts: CardPost[] = data.map((post) => {
    if (!('categories' in post)) return post

    const categories = [...post.categories].sort(
      (a, b) => Number(childIds.has(b.id)) - Number(childIds.has(a.id)),
    )
    return { ...post, categories }
  })

  if (posts.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-6">Блоги</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showAuthor />
        ))}
      </div>
      <div className="mt-6 text-right">
        <Link
          href="https://next.sysblok.team/posts?category=1773"
          className="text-sm text-blue-600 hover:underline"
        >
          Больше записей из блогов →
        </Link>
      </div>
    </section>
  )
}

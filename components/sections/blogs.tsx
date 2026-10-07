import {
  getCategoryBySlug,
  getChildCategories,
  getPostsPaginated,
  getAuthorPhotoById,
} from '@/lib/wordpress'
import type { CardPost } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

export async function Blogs() {
  const blogCategory = await getCategoryBySlug('blog')

  if (!blogCategory) return null

  // У блога каждого автора своя дочерняя рубрика (blog_dmitrii_pronin и т. д.)
  const blogs = await getChildCategories(blogCategory.id)

  // По одной последней записи из каждого блога
  const latest = await Promise.all(
    blogs.map(async (blog): Promise<CardPost[]> => {
      const { data } = await getPostsPaginated(1, 1, { categories: blog.id })
      const post = data[0]

      if (!post) return []
      if (!('categories' in post)) return [post]

      // PostCard подписывает карточку первой рубрикой поста. Ставим первой рубрику блога,
      // чтобы вместо родительской «Блоги» было название блога («Блог Дмитрия Пронина»).
      const categories = [...post.categories].sort(
        (a, b) => Number(b.id === blog.id) - Number(a.id === blog.id),
      )
      return [{ ...post, categories }]
    }),
  )

  // Блоги с самыми свежими записями идут первыми, как на проде
  const posts = latest
    .flat()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3)

  if (posts.length === 0) return null

  // Фото автора приходит в _embedded только как id (даже с acf_format=standard),
  // поэтому url нужно получить отдельным запросом на автора. По одному автору
  // на карточку, запросы кэшируются по author-${id}.
  const postsWithPhotos = await Promise.all(
    posts.map(async (post) => {
      const photoId = post.author?.acf?.photo
      if (typeof photoId !== 'number' || !post.author) return post

      const photoUrl = await getAuthorPhotoById(post.author.id)
      if (!photoUrl) return post

      return {
        ...post,
        author: {
          ...post.author,
          acf: { ...post.author.acf, photo: photoUrl },
        },
      }
    }),
  )

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-6">Блоги</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {postsWithPhotos.map((post) => (
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

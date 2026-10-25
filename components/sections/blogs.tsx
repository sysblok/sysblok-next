import {
  AUTHOR_PHOTO_PLACEHOLDER,
  getAuthorPhotoById,
  getCategoryBySlug,
  getChildCategories,
  getPostsPaginated,
} from '@/lib/wordpress'
import type { CardPost } from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import Link from 'next/link'

// Фото автора приходит в _embedded только как id (даже с acf_format=standard),
// поэтому url нужно получить отдельным запросом на автора (кэшируется по author-${id}).
// Ошибка запроса не должна ронять весь блок — тогда показываем плейсхолдер.
async function getAuthorPhoto(author: CardPost['author']): Promise<string> {
  const photo = author?.acf?.photo
  if (typeof photo === 'string') return photo
  if (!author || typeof photo !== 'number') return AUTHOR_PHOTO_PLACEHOLDER

  try {
    return (await getAuthorPhotoById(author.id)) ?? AUTHOR_PHOTO_PLACEHOLDER
  } catch (error) {
    console.error(`Failed to fetch photo for author ${author.id}:`, error)
    return AUTHOR_PHOTO_PLACEHOLDER
  }
}

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

  const postsWithPhotos = await Promise.all(
    posts.map(async (post) =>
      post.author
        ? {
            ...post,
            author: {
              ...post.author,
              acf: { ...post.author.acf, photo: await getAuthorPhoto(post.author) },
            },
          }
        : post,
    ),
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
        <Link href="https://next.sysblok.team/posts?category=1773" className="text-right">
          Больше записей из блогов →
        </Link>
      </div>
    </section>
  )
}

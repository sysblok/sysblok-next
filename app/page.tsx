// Craft Imports
import { Container } from '@/components/craft'

import {
  getCategoryBySlug,
  getPostsPaginated,
  getStickyPost,
  resolveCoauthorNames,
} from '@/lib/wordpress'
import { PostCard } from '@/components/posts/post-card'
import { FeaturedPostCard } from '@/components/posts/featured-post-card'
import { News } from '@/components/carousel/news'
import { Blogs } from '@/components/sections/blogs'

import { CategorySection } from '@/components/sections/category-section'

import { Tiles } from '@/components/sections/tiles'

import './home.css'

// This page is using the craft.tsx component and design system
export default async function Home() {
  // Получаем только id категории для исключения из основных постов
  const newsCategory = await getCategoryBySlug('news')
  // Получаем закрепленный пост
  const stickyPost = await getStickyPost()

  const { data } = await getPostsPaginated(1, 30, {
    categories_exclude: newsCategory.id,
    exclude: stickyPost ? [stickyPost.id] : undefined,
  })
  const [posts, [sticky]] = await Promise.all([
    resolveCoauthorNames(data),
    resolveCoauthorNames(stickyPost ? [stickyPost] : []),
  ])

  return (
    <Container>
      {/* Закрепленный пост */}
      {sticky && (
        <div className="mb-8">
          <FeaturedPostCard post={sticky} />
        </div>
      )}
      <CategorySection slug="portaly" title="Проекты" moreLabel="Больше проектов" />
      <CategorySection slug="data-istorii" title="Дата-истории" moreLabel="Больше дата-историй" />
      <News categoryId={newsCategory.id} />
      <Tiles />

      <Blogs />
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="h-24 w-full border bg-accent/25 flex items-center justify-center">
          <p>No posts found</p>
        </div>
      )}
    </Container>
  )
}

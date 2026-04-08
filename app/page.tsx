// Craft Imports
import { Container, Prose } from "@/components/craft";

import { getCategoryBySlug, getPostsPaginated } from "@/lib/wordpress";
import { PostCard } from "@/components/posts/post-card";
import { News } from "@/components/carousel/news";
import { Blogs } from "@/components/sections/blogs";

// This page is using the craft.tsx component and design system
export default async function Home() {
  // Получаем только id категории для исключения из основных постов
  const newsCategory = await getCategoryBySlug("news");

  const { data: posts } = await getPostsPaginated(1, 30, {
    categories_exclude: newsCategory.id,
  });

  return (
    <Container>
      <Prose>
        <h1>Системный Блокъ </h1>
      </Prose>

      {/* Секция с новостями в карусели */}
      <News categoryId={newsCategory.id} />
      <Blogs />
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
          <p>No posts found</p>
        </div>
      )}
    </Container>
  );
}

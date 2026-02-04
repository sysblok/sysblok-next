import { getCategoryBySlug, getPostsFromSubcategories } from "@/lib/wordpress";
import { PostCard } from "@/components/posts/post-card";
import Link from "next/link";

export async function Blogs() {
  const blogCategory = await getCategoryBySlug("blog");

  if (!blogCategory) return null;

  const posts = await getPostsFromSubcategories(blogCategory.id, 3);

  if (posts.length === 0) return null;

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
  );
}

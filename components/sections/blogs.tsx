import { getPostsPaginated } from "@/lib/wordpress";
import { PostCard } from "@/components/posts/post-card";
import Link from "next/link";

export async function Blogs({ categoryId }: { categoryId: number }) {
  const { data: posts } = await getPostsPaginated(1, 3, {
    categories: categoryId,
  });

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
        <Link href="/blogs" className="text-sm text-blue-600 hover:underline">
          Больше записей из блогов →
        </Link>
      </div>
    </section>
  );
}

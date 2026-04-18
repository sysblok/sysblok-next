import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { CardPost } from "@/lib/wordpress";

interface PostCardProps {
  post: CardPost;
  showAuthor?: boolean;
}

export function PostCard({ post, showAuthor = false }: PostCardProps) {
  const media = post.featuredMedia;
  const date = post.date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const category = "categories" in post ? post.categories?.[0] : undefined;

  return (
    <Link
      href={
        "categories" in post ? `/posts/${post.slug}` : `/pages/${post.slug}`
      }
      className={cn(
        "border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-8",
        "hover:bg-accent/75 transition-all",
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Блок автора */}
        {showAuthor && author && (
          <div className="flex items-start gap-3 pb-4 border-b">
            {author.avatar_urls?.["96"] && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={author.avatar_urls["96"]}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{author.name}</h3>
              {author.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {author.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Мета-информация (для блогов - вместо изображения) */}
        {showAuthor && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="text-blue-600">{category?.name || "блог"}</span>
            <span>—</span>
            <span>{date}</span>
          </div>
        )}

        {/* Изображение поста (только для обычных карточек) */}
        {!showAuthor && media?.sourceUrl && (
          <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
            <Image
              className="h-full w-full object-cover"
              src={media.sourceUrl}
              alt={media.altText || post.title || "Post thumbnail"}
              width={400}
              height={200}
            />
          </div>
        )}

        {/* Заголовок */}
        <div
          dangerouslySetInnerHTML={{
            __html: post.title || "Untitled Post",
          }}
          className={cn(
            "text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all",
            showAuthor ? "text-lg line-clamp-3" : "text-xl",
          )}
        />

        {/* Превью текста */}
        <div className="text-sm text-muted-foreground">
          {post.excerpt
            ? post.excerpt
                .split(" ")
                .slice(0, showAuthor ? 30 : 24)
                .join(" ")
                .trim() + "..."
            : "No excerpt available"}
        </div>
      </div>

      {/* Футер карточки (только для обычных постов) */}
      {!showAuthor && (
        <div className="flex flex-col gap-4">
          <hr />
          <div className="flex justify-between items-center text-xs">
            <p>{category?.name || "Uncategorized"}</p>
            <p>{date}</p>
          </div>
        </div>
      )}
    </Link>
  );
}

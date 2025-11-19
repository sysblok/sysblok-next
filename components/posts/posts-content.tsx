import {
  getPostsPaginated,
} from "@/lib/wordpress";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { PostCard } from "@/components/posts/post-card";

export async function PostsContent({
  author,
  tag,
  category,
  page,
  postsPerPage,
  search,
}: {
  author?: string;
  tag?: string;
  category?: string;
  page: number;
  postsPerPage: number;
  search?: string;
}) {

  // Fetch data based on search parameters using efficient pagination
  const [postsResponse] = await Promise.all([
    getPostsPaginated(page, postsPerPage, { author, tags: tag, categories: category, search }),
  ]);

  const { data: posts, headers } = postsResponse;
  const { total, totalPages } = headers;

   // Create pagination URL helper
   const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    if (search) params.set("search", search);
    return `/posts${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <>
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center py-8">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href={createPaginationUrl(page - 1)}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // Show current page, first page, last page, and 2 pages around current
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1
                  );
                })
                .map((pageNum, index, array) => {
                  const showEllipsis =
                    index > 0 && pageNum - array[index - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <PaginationItem>
                        <PaginationLink
                          href={createPaginationUrl(pageNum)}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  );
                })}

              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext href={createPaginationUrl(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}
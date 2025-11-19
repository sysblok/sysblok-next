import { getPostsPaginated } from "@/lib/wordpress";

interface PostCountProps {
  page: number;
  postsPerPage: number;
  author?: string;
  tag?: string;
  category?: string;
  search?: string;
}

export default async function PostCount({ 
  page, 
  postsPerPage, 
  author, 
  tag, 
  category, 
  search 
}: PostCountProps) {
  const [postsResponse] = await Promise.all([
    getPostsPaginated(page, postsPerPage, { author, tags: tag, categories: category, search }),
  ]);

  const { headers } = postsResponse;
  const { total } = headers;

  return (
    <p className="text-muted-foreground">
      {total} {total === 1 ? "post" : "posts"} found
      {search && " matching your search"}
    </p>
  );
}
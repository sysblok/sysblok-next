import {
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
} from "@/lib/wordpress";

import { Section, Container, Prose } from "@/components/craft";

import { FilterPosts } from "@/components/posts/filter";
import { SearchInput } from "@/components/posts/search-input";
import { PostsContent } from "@/components/posts/posts-content";
import PostCount from "@/components/posts/posts-count";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog Posts",
  description: "Browse all our blog posts",
};

export const dynamic = "auto";
export const revalidate = 600;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    author?: string;
    tag?: string;
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {

  const postsPerPage = 9;
  const params = await searchParams;
  const { author, tag, category, page: pageParam, search } = params;

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  const [authors, tags, categories] = await Promise.all([
    search ? searchAuthors(search) : getAllAuthors(),
    search ? searchTags(search) : getAllTags(),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <Prose>
            <h2>All Posts</h2>
            <Suspense fallback={<p className="text-muted-foreground">Loading posts...</p>}>
              <PostCount 
                page={page}
                postsPerPage={postsPerPage}
                author={author}
                tag={tag}
                category={category}
                search={search}
              />
            </Suspense>
          </Prose>

          <div className="space-y-4">
            <SearchInput defaultValue={search} />

            <FilterPosts
              authors={authors}
              tags={tags}
              categories={categories}
              selectedAuthor={author}
              selectedTag={tag}
              selectedCategory={category}
            />
          </div>
          <Suspense fallback={<p className="text-muted-foreground">Loading posts...</p>}>
            <PostsContent
              author={author}
              tag={tag}
              category={category}
              page={page}
              postsPerPage={postsPerPage}
              search={search}
            />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
}

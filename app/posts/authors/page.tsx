import { getAllAuthors } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Authors",
  description: "Browse all authors of our blog posts",
  alternates: {
    canonical: "/posts/authors",
  },
};

function getAuthorDisplayName(author: any): string {
  if (author.display_name) {
    return author.display_name;
  }

  if (author.first_name || author.last_name) {
    return `${author.first_name || ""} ${author.last_name || ""}`.trim();
  }

  if (author.slug) {
    const cleanSlug = author.slug.replace(/^cap-/, "");
    const formatted = cleanSlug
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (formatted) return formatted;
  }

  return author.name;
}

export default async function Page() {
  const authors = await getAllAuthors();

  return (
    <Section>
      <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>All Authors</h2>
          <ul className="grid">
            {authors.map((author: any) => (
              <li key={author.id}>
                <Link href={`/posts/?author=${author.id}`}>
                  {getAuthorDisplayName(author)}
                </Link>
              </li>
            ))}
          </ul>
        </Prose>
        <BackButton />
      </Container>
    </Section>
  );
}

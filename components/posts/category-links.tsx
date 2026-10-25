import Link from 'next/link'

import type { Category } from '@/lib/wordpress.d'

export function CategoryLinks({ categories }: { categories?: Category[] }) {
  if (!categories?.length) return null

  return (
    <span className="entry-cats">
      {categories.map((cat, i) => (
        <span key={cat.id}>
          {i > 0 && ', '}
          <Link
            href={`/posts?category=${cat.slug}`}
            rel="category tag"
            className="relative z-10 hover:underline transition-colors"
          >
            {cat.name}
          </Link>
        </span>
      ))}
    </span>
  )
}

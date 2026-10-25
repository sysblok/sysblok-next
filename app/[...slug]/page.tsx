import { getPostBySlug, getPageBySlug, getPostAcf } from '@/lib/wordpress'
import { notFound } from 'next/navigation'
import PostEntry from '@/app/(entry)/components/post-entry'
import PageEntry from '@/app/(entry)/components/page-entry'

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const lastSlug = slug[slug.length - 1]

  // Try post first
  const post = await getPostBySlug(lastSlug)
  if (post) {
    const acf = await getPostAcf(post.id, ['creators', 'editors_note'])
    return <PostEntry post={post} acf={acf} />
  }

  // Try page
  const page = await getPageBySlug(lastSlug)
  if (page) {
    const acf = await getPostAcf(page.id, ['creators'])
    return <PageEntry page={page} acf={acf} />
  }

  notFound()
}

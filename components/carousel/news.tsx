import { getCategoryBySlug, getPostsPaginated } from '@/lib/wordpress'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

interface NewsCarouselProps {
  categoryId?: number
  categorySlug?: string
  limit?: number
  className?: string
  title?: string
}

export async function News({
  categoryId,
  categorySlug = 'news',
  limit = 10,
  className,
  title = 'Новости',
}: NewsCarouselProps) {
  // Если categoryId не передан, получаем его через slug
  const newsCategoryId = categoryId || (await getCategoryBySlug(categorySlug)).id

  const { data: newsPosts } = await getPostsPaginated(1, limit, {
    categories: newsCategoryId,
  })

  // Трансформируем посты WordPress в формат для карусели
  const newsItems = newsPosts.map((post) => ({
    id: post.id,
    title: post.title || 'Untitled Post',
    description: post.excerpt || 'No excerpt available',
    image: post.featuredMedia?.sourceUrl || '/images/placeholder.jpg',
    date: post.date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    url: `/posts/${post.slug}`,
  }))

  if (newsItems.length === 0) {
    return null
  }

  return (
    <div className="my-12">
      <h2>{title}</h2>
      <div className="w-full max-w-6xl mx-auto px-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className={className}
        >
          <CarouselContent>
            {newsItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>

                  <CardDescription className="line-clamp-3 m-6 mt-3">
                    {item.description}
                  </CardDescription>
                  <time dateTime={item.date} className="news-excerpt">
                    {item.date}
                  </time>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious variant="ghost" className="rounded-none border-0" />
          <CarouselNext variant="ghost" className="rounded-none border-0" />
        </Carousel>
      </div>
    </div>
  )
}

import { getCategoryBySlug, getPostsPaginated } from "@/lib/wordpress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface NewsCarouselProps {
  categoryId?: number;
  categorySlug?: string;
  limit?: number;
  className?: string;
  title?: string;
}

export async function News({
  categoryId,
  categorySlug = "news",
  limit = 10,
  className,
  title = "Последние новости",
}: NewsCarouselProps) {
  // Если categoryId не передан, получаем его через slug
  const newsCategoryId =
    categoryId || (await getCategoryBySlug(categorySlug)).id;

  const { data: newsPosts } = await getPostsPaginated(1, limit, {
    categories: newsCategoryId,
  });

  // Трансформируем посты WordPress в формат для карусели
  const newsItems = newsPosts.map((post) => ({
    id: post.id,
    title: post.title || "Untitled Post",
    description: post.excerpt || "No excerpt available",
    image: post.featuredMedia?.sourceUrl || "/images/placeholder.jpg",
    date: post.date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    url: `/posts/${post.slug}`,
  }));

  if (newsItems.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="w-full max-w-6xl mx-auto px-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className={className}
        >
          <CarouselContent>
            {newsItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  {/* <div className="relative h-48 w-full mb-4 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div> */}
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <time
                    dateTime={item.date}
                    className="text-sm text-muted-foreground px-6"
                  >
                    {item.date}
                  </time>
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                  <CardFooter>
                    {item.url && (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Читать далее →
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}

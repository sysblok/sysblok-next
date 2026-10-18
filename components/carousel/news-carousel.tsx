'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export interface NewsCarouselItem {
  id: number
  url: string
  title: string
  description: string
  date: string // для отображения: 29.09.2026
  dateISO: string // для атрибута dateTime
}

export function NewsCarousel({ items }: { items: NewsCarouselItem[] }) {
  const [viewportRef, api] = useEmblaCarousel({ align: 'start', loop: true })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = useCallback(() => api?.scrollNext(), [api])

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCanPrev(api.canScrollPrev())
      setCanNext(api.canScrollNext())
    }

    update()
    api.on('select', update)
    api.on('reInit', update)

    return () => {
      api.off('select', update)
      api.off('reInit', update)
    }
  }, [api])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollNext()
    }
  }

  return (
    <div
      className="news-slider__root"
      role="region"
      aria-roledescription="carousel"
      onKeyDownCapture={onKeyDown}
    >
      <div className="news-slider__viewport" ref={viewportRef}>
        <div className="news-slider__container">
          {items.map((item) => (
            <div
              key={item.id}
              className="news-slider__slide"
              role="group"
              aria-roledescription="slide"
            >
              <Link href={item.url} className="news-slider__card" draggable={false}>
                <h3 className="news-slider__title">{item.title}</h3>
                <p className="news-slider__excerpt">{item.description}</p>
                <time className="news-slider__date" dateTime={item.dateISO}>
                  {item.date}
                </time>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="news-slider__arrow news-slider__arrow--prev"
        onClick={scrollPrev}
        disabled={!canPrev}
      >
        <ArrowLeft size={16} />
        <span className="news-slider__sr-only">Previous slide</span>
      </button>
      <button
        type="button"
        className="news-slider__arrow news-slider__arrow--next"
        onClick={scrollNext}
        disabled={!canNext}
      >
        <ArrowRight size={16} />
        <span className="news-slider__sr-only">Next slide</span>
      </button>
    </div>
  )
}

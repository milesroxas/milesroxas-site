'use client'

import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Media } from '@/components/Media'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { useBlockTheme } from '@/hooks/useBlockTheme'
import { useSpacing } from '@/hooks/useSpacing'
import type { SliderBlock as SliderBlockType } from '@/payload-types'
import { CursorSlider } from '@/providers/Cursor/components/CursorInteractions'
import { cn } from '@/utilities/ui'

type SliderBlockProps = SliderBlockType & { className?: string; fullWidth?: boolean }

export const SliderBlock: React.FC<SliderBlockProps> = ({
  theme,
  id,
  introContent,
  slides,
  style = 'default',
  className,
  space,
  fullWidth = false,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  const spacingStyles = useSpacing(space)

  const appliedTheme = useBlockTheme(theme)

  type SliderLink = NonNullable<SliderBlockType['slides']>[number]['slide']['link']

  const hasSlug = (value: unknown): value is { slug: string } =>
    typeof value === 'object' && value !== null && 'slug' in value

  const getHref = (link?: SliderLink | null) => {
    if (!link) return '#'
    const { relationTo, value } = link as { relationTo: string; value: unknown }
    if (hasSlug(value)) {
      return `${relationTo !== 'pages' ? `/${relationTo}` : ''}/${value.slug}`
    }
    return `/${relationTo}/${String(value)}`
  }

  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)

    // Initial call to set the current index
    handleSelect()

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  return (
    <div data-theme={appliedTheme} className={cn('w-full', className)} id={`block-${id}`}>
      <div style={spacingStyles} className="bg-background text-foreground">
        {introContent && (
          <div className={cn({ container: !fullWidth, 'px-8 md:px-14': fullWidth }, 'mb-12')}>
            {introContent.heading && (
              <h2
                className={cn('mb-2', {
                  'text-left': introContent.align === 'left' || !introContent.align,
                  'text-center': introContent.align === 'center',
                  'text-xl font-medium': introContent.size === 'base' || !introContent.size,
                  'text-2xl font-medium': introContent.size === 'lg',
                  'text-3xl font-medium': introContent.size === 'xl',
                })}
              >
                {introContent.heading}
              </h2>
            )}
            {introContent.subheading && (
              <p
                className={cn('text-muted-foreground px-8 md:px-14', {
                  'text-left': introContent.align === 'left' || !introContent.align,
                  'text-center': introContent.align === 'center',
                })}
              >
                {introContent.subheading}
              </p>
            )}
          </div>
        )}

        {style === 'single' ? (
          <div className={cn({ 'mx-auto max-w-4xl': !fullWidth, 'w-full': fullWidth })}>
            <CursorSlider>
              <Carousel
                className="w-full overflow-hidden rounded-md"
                style={{ transition: 'none' }}
                setApi={setApi}
                opts={{
                  loop: false,
                  align: 'center',
                  containScroll: false,
                  skipSnaps: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="gap-4">
                  {slides &&
                    slides.map(({ slide }, index) => (
                      <CarouselItem key={index} className="w-full basis-full">
                        <div className="mx-auto aspect-[16/9] w-full">
                          {slide.link ? (
                            <Link
                              href={getHref(slide.link)}
                              className="block aspect-[16/9] w-full overflow-hidden rounded-md"
                            >
                              {slide.image && (
                                <Media
                                  resource={slide.image}
                                  priority={index === 0}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="h-full w-full object-cover"
                                  imgClassName="rounded-md overflow-hidden"
                                  size={fullWidth ? '100vw' : '(max-width: 1024px) 100vw, 1024px'}
                                />
                              )}
                              {slide.caption && (
                                <div className="mt-2">
                                  <p className="text-muted-foreground text-sm">{slide.caption}</p>
                                </div>
                              )}
                            </Link>
                          ) : (
                            <div className="flex aspect-[16/9] w-full flex-col items-center justify-center overflow-hidden rounded-md">
                              {slide.image && (
                                <Media
                                  resource={slide.image}
                                  priority={index === 0}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="h-full w-full object-cover"
                                  imgClassName="rounded-md overflow-hidden"
                                  size={fullWidth ? '100vw' : '(max-width: 1024px) 100vw, 1024px'}
                                />
                              )}
                              {slide.caption && (
                                <div className="mt-2">
                                  <p className="text-muted-foreground text-sm">{slide.caption}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
              </Carousel>
            </CursorSlider>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <CursorSlider>
              <Carousel
                className="w-full"
                style={{ transition: 'none' }}
                setApi={setApi}
                opts={{
                  loop: true,
                  align: 'center',
                  containScroll: false,
                  skipSnaps: false,
                  duration: 40,
                }}
              >
                <CarouselContent className="gap-2">
                  {slides &&
                    slides.map(({ slide }, index) => (
                      <CarouselItem
                        key={index}
                        className={cn(
                          'basis-4/6 md:basis-3/4 lg:basis-2/3 2xl:basis-1/2',
                          currentIndex === index ? 'z-20' : 'opacity-30',
                        )}
                      >
                        <div
                          className={cn(
                            'transition-all duration-300 ease-out',
                            currentIndex === index ? 'scale-110' : 'scale-90',
                          )}
                        >
                          {slide.link ? (
                            <Link
                              href={getHref(slide.link)}
                              className="block w-full overflow-hidden rounded-md"
                            >
                              {slide.image && (
                                <Media
                                  resource={slide.image}
                                  priority={index === 0}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="w-full overflow-hidden rounded-md object-cover"
                                  imgClassName="rounded-md overflow-hidden"
                                  size={
                                    fullWidth
                                      ? '100vw'
                                      : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, (max-width: 2000px) 80vw, 65vw'
                                  }
                                />
                              )}
                              {slide.caption && (
                                <div className="mt-2">
                                  <p className="text-muted-foreground text-sm">{slide.caption}</p>
                                </div>
                              )}
                            </Link>
                          ) : (
                            <div className="flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-md">
                              {slide.image && (
                                <Media
                                  resource={slide.image}
                                  priority={index === 0}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="w-full object-cover"
                                  imgClassName="rounded-md overflow-hidden"
                                  size={
                                    fullWidth
                                      ? '100vw'
                                      : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, (max-width: 2000px) 80vw, 65vw'
                                  }
                                />
                              )}
                              {slide.caption && (
                                <div className="mt-2">
                                  <p className="text-muted-foreground text-sm">{slide.caption}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
              </Carousel>
            </CursorSlider>
          </div>
        )}
      </div>
    </div>
  )
}

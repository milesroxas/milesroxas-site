'use client'

import React, { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

import Link from 'next/link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { useTheme } from '@/providers/Theme'

export type SliderBlockProps = {
  theme?: 'light' | 'dark' | 'system'
  introContent?: {
    heading?: string
    subheading?: string
    size?: 'base' | 'lg' | 'xl'
    align?: 'left' | 'center'
  }
  space?: {
    pt?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    pb?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    mt?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    mb?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }
  slides: {
    slide: {
      image: any
      caption?: string
      link?: {
        relationTo: 'works' | 'posts'
        value: string | number | Record<string, any>
      }
    }
  }[]
  style?: 'default' | 'single' | 'cropped'
  blockType: 'slider'
  className?: string
  fullWidth?: boolean
}

export const SliderBlock: React.FC<SliderBlockProps & { id?: string }> = ({
  theme: propTheme,
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
  const { theme: systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const getSpacingClasses = (space?: SliderBlockProps['space']) => {
    if (!space) return {}
    return {
      'pt-0': space.pt === 'none',
      'pt-12': space.pt === 'sm',
      'pt-40': space.pt === 'md',
      'pt-64': space.pt === 'lg',
      'pt-80': space.pt === 'xl',
      'pb-0': space.pb === 'none',
      'pb-12': space.pb === 'sm',
      'pb-40': space.pb === 'md',
      'pb-64': space.pb === 'lg',
      'pb-80': space.pb === 'xl',
      'mt-0': space.mt === 'none',
      'mt-12': space.mt === 'sm',
      'mt-40': space.mt === 'md',
      'mt-64': space.mt === 'lg',
      'mt-80': space.mt === 'xl',
      'mb-0': space.mb === 'none',
      'mb-12': space.mb === 'sm',
      'mb-40': space.mb === 'md',
      'mb-64': space.mb === 'lg',
      'mb-80': space.mb === 'xl',
    }
  }

  const getHref = (link: { relationTo: string; value: string | number | Record<string, any> }) => {
    if (!link) return '#'
    if (typeof link.value === 'object' && link.value !== null && link.value.slug) {
      return `${link.relationTo !== 'pages' ? `/${link.relationTo}` : ''}/${link.value.slug}`
    }
    return `/${link.relationTo}/${link.value}`
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

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine the active theme based on the prop and system theme
  const activeTheme =
    propTheme === 'dark'
      ? 'dark'
      : mounted && (propTheme === 'system' || !propTheme)
        ? systemTheme
        : propTheme || 'light'

  return (
    <div
      data-theme={activeTheme}
      className={cn(
        'theme-transition w-full',
        {
          'bg-primary text-primary-foreground font-light': activeTheme === 'dark',
          'bg-background text-foreground': activeTheme === 'light',
        },
        className,
        getSpacingClasses(space),
      )}
      id={`block-${id}`}
    >
      {introContent && (
        <div className={cn({ container: !fullWidth, 'px-4 md:px-6 lg:px-8': fullWidth }, 'mb-12')}>
          {introContent.heading && (
            <h2
              className={cn('mb-2', {
                'text-left': introContent.align === 'left' || !introContent.align,
                'text-center': introContent.align === 'center',
                'text-2xl font-bold': introContent.size === 'base' || !introContent.size,
                'text-3xl font-bold': introContent.size === 'lg',
                'text-4xl font-bold': introContent.size === 'xl',
              })}
            >
              {introContent.heading}
            </h2>
          )}
          {introContent.subheading && (
            <p
              className={cn('text-muted-foreground', {
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
        <div className={cn({ 'mx-auto max-w-4xl px-4': !fullWidth, 'w-full': fullWidth })}>
          <Carousel
            className="w-full"
            style={{ transition: 'none' }}
            setApi={setApi}
            opts={{
              loop: true,
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
                          className="block aspect-[16/9] w-full overflow-hidden"
                        >
                          {slide.image && (
                            <Media
                              resource={slide.image}
                              priority={index === 0}
                              loading={index === 0 ? 'eager' : 'lazy'}
                              className="h-full w-full object-cover"
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
                        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center">
                          {slide.image && (
                            <Media
                              resource={slide.image}
                              priority={index === 0}
                              loading={index === 0 ? 'eager' : 'lazy'}
                              className="h-full w-full object-cover"
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
        </div>
      ) : (
        <div className="w-full overflow-hidden">
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
                      'md:basis-3/4 lg:basis-2/3',
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
                        <Link href={getHref(slide.link)} className="block w-full overflow-hidden">
                          {slide.image && (
                            <Media
                              resource={slide.image}
                              priority={index === 0}
                              loading={index === 0 ? 'eager' : 'lazy'}
                              className="h-full w-full object-cover"
                              size={
                                fullWidth
                                  ? '100vw'
                                  : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw'
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
                        <div className="flex aspect-[4/3] flex-col items-center justify-center">
                          {slide.image && (
                            <Media
                              resource={slide.image}
                              priority={index === 0}
                              loading={index === 0 ? 'eager' : 'lazy'}
                              className="h-full w-full object-cover"
                              size={
                                fullWidth
                                  ? '100vw'
                                  : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw'
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
        </div>
      )}
    </div>
  )
}

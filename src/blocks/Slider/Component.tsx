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

export type SliderBlockProps = {
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
}

export const SliderBlock: React.FC<SliderBlockProps & { id?: string }> = ({
  id,
  introContent,
  slides,
  style = 'default',
  className,
  space,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  const getSpacingClasses = (space?: SliderBlockProps['space']) => {
    if (!space) return {}

    return {
      'pt-0': space.pt === 'none',
      'pt-12': space.pt === 'sm',
      'pt-16': space.pt === 'md',
      'pt-32': space.pt === 'lg',
      'pt-64': space.pt === 'xl',

      'pb-0': space.pb === 'none',
      'pb-12': space.pb === 'sm',
      'pb-16': space.pb === 'md',
      'pb-32': space.pb === 'lg',
      'pb-64': space.pb === 'xl',

      'mt-0': space.mt === 'none',
      'mt-12': space.mt === 'sm',
      'mt-16': space.mt === 'md',
      'mt-32': space.mt === 'lg',
      'mt-64': space.mt === 'xl',

      'mb-0': space.mb === 'none',
      'mb-12': space.mb === 'sm',
      'mb-16': space.mb === 'md',
      'mb-32': space.mb === 'lg',
      'mb-64': space.mb === 'xl',
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

  return (
    <div className={cn(className, getSpacingClasses(space))} id={`block-${id}`}>
      {introContent && (
        <div className="container mb-12">
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
              className={cn('text-gray-500', {
                'text-left': introContent.align === 'left' || !introContent.align,
                'text-center': introContent.align === 'center',
              })}
            >
              {introContent.subheading}
            </p>
          )}
        </div>
      )}

      <div
        className={cn('overflow-hidden', {
          'mx-auto max-w-6xl px-4': style === 'single',
        })}
      >
        <Carousel
          className={cn('w-full', {
            'max-w-full': style === 'single',
          })}
          style={{ transition: 'none' }}
          setApi={setApi}
          opts={{
            loop: true,
            align: style === 'single' ? 'start' : 'center',
            containScroll: style === 'single' ? false : 'trimSnaps',
            skipSnaps: style === 'single',
            duration: style === 'default' ? 40 : 25,
          }}
        >
          <CarouselContent
            className={cn('slider-content', style === 'default' ? '-ml-2 md:-ml-4' : '')}
            style={style === 'single' ? { marginLeft: 0, marginRight: 0 } : {}}
          >
            {slides &&
              slides.map(({ slide }, index) => (
                <CarouselItem
                  key={index}
                  className={cn(
                    {
                      'pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3': style === 'default',
                      'w-full basis-full px-0': style === 'single',
                      'pl-2 md:basis-1/2 md:pl-4 lg:basis-1/2': style === 'cropped',
                    },
                    currentIndex === index
                      ? 'z-10'
                      : style === 'default' || style === 'cropped'
                        ? 'opacity-50'
                        : '',
                  )}
                  style={style === 'single' ? { paddingLeft: 0 } : {}}
                >
                  <div
                    className={cn(
                      'p-1 transition-all duration-300 ease-out',
                      style === 'single' ? 'mx-auto aspect-[16/9] w-full' : '',
                      style === 'default' && (currentIndex === index ? 'scale-110' : 'scale-90'),
                      style === 'cropped' && (currentIndex === index ? 'scale-110' : 'scale-90'),
                    )}
                  >
                    {slide.link ? (
                      <Link
                        href={getHref(slide.link)}
                        className={cn(
                          'block w-full overflow-hidden',
                          style === 'single' ? 'aspect-[16/9] w-full' : '',
                        )}
                      >
                        {slide.image && (
                          <Media
                            resource={slide.image}
                            priority={index === 0}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            className="h-full w-full object-cover"
                            size={
                              style === 'single'
                                ? '(max-width: 1024px) 100vw, 1024px'
                                : '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw'
                            }
                          />
                        )}
                        {slide.caption && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">{slide.caption}</p>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center',
                          style === 'single' ? 'aspect-[16/9] w-full' : 'aspect-[4/3]',
                        )}
                      >
                        {slide.image && (
                          <Media
                            resource={slide.image}
                            priority={index === 0}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            className="h-full w-full object-cover"
                            size={
                              style === 'single'
                                ? '(max-width: 1024px) 100vw, 1024px'
                                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            }
                          />
                        )}
                        {slide.caption && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">{slide.caption}</p>
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
    </div>
  )
}

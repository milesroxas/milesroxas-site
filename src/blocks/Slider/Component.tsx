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
import { slideKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'

type SliderBlockProps = SliderBlockType & { className?: string; fullWidth?: boolean }

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

interface SlideContentProps {
  slide: NonNullable<SliderBlockType['slides']>[number]['slide']
  index: number
  fullWidth: boolean
  isSingleStyle?: boolean
}

const SlideContent: React.FC<SlideContentProps> = ({
  slide,
  index,
  fullWidth,
  isSingleStyle = false,
}) => {
  const mediaSize = isSingleStyle
    ? fullWidth
      ? '100vw'
      : '(max-width: 1024px) 100vw, 1024px'
    : fullWidth
      ? '100vw'
      : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, (max-width: 2000px) 80vw, 65vw'

  const mediaClassName = isSingleStyle
    ? 'h-full w-full object-cover'
    : 'w-full overflow-hidden rounded-md object-cover'

  const containerClassName = isSingleStyle
    ? 'mx-auto aspect-[16/9] w-full'
    : 'flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-md'

  const mediaElement = slide.image && (
    <Media
      resource={slide.image}
      priority={index === 0}
      loading={index === 0 ? 'eager' : 'lazy'}
      className={mediaClassName}
      imgClassName="rounded-md overflow-hidden"
      size={mediaSize}
    />
  )

  const captionElement = slide.caption && (
    <div className="mt-2">
      <p className="text-muted-foreground text-sm">{slide.caption}</p>
    </div>
  )

  if (slide.link) {
    const linkClassName = isSingleStyle
      ? 'block aspect-[16/9] w-full overflow-hidden rounded-md'
      : 'block w-full overflow-hidden rounded-md'

    return (
      <Link href={getHref(slide.link)} className={linkClassName}>
        {mediaElement}
        {captionElement}
      </Link>
    )
  }

  return (
    <div className={containerClassName}>
      {mediaElement}
      {captionElement}
    </div>
  )
}

const SingleStyleSlider: React.FC<{
  slides: NonNullable<SliderBlockType['slides']>
  setApi: (api: CarouselApi) => void
  fullWidth: boolean
}> = ({ slides, setApi, fullWidth }) => (
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
          {slides.map(({ slide }, index) => (
            <CarouselItem key={slideKeys.fromSlide(slide, index)} className="w-full basis-full">
              <div className="mx-auto aspect-video w-full">
                <SlideContent slide={slide} index={index} fullWidth={fullWidth} isSingleStyle />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </CursorSlider>
  </div>
)

const DefaultStyleSlider: React.FC<{
  slides: NonNullable<SliderBlockType['slides']>
  setApi: (api: CarouselApi) => void
  currentIndex: number
  fullWidth: boolean
}> = ({ slides, setApi, currentIndex, fullWidth }) => (
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
          {slides.map(({ slide }, index) => (
            <CarouselItem
              key={slideKeys.fromSlide(slide, index)}
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
                <SlideContent slide={slide} index={index} fullWidth={fullWidth} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </CursorSlider>
  </div>
)

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

  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)
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
                  'font-medium text-xl': introContent.size === 'base' || !introContent.size,
                  'font-medium text-2xl': introContent.size === 'lg',
                  'font-medium text-3xl': introContent.size === 'xl',
                })}
              >
                {introContent.heading}
              </h2>
            )}
            {introContent.subheading && (
              <p
                className={cn('px-8 text-muted-foreground md:px-14', {
                  'text-left': introContent.align === 'left' || !introContent.align,
                  'text-center': introContent.align === 'center',
                })}
              >
                {introContent.subheading}
              </p>
            )}
          </div>
        )}

        {style === 'single' && slides ? (
          <SingleStyleSlider slides={slides} setApi={setApi} fullWidth={fullWidth} />
        ) : slides ? (
          <DefaultStyleSlider
            slides={slides}
            setApi={setApi}
            currentIndex={currentIndex}
            fullWidth={fullWidth}
          />
        ) : null}
      </div>
    </div>
  )
}

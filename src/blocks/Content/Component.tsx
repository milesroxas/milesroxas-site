'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useState } from 'react'

import type { ContentBlock as ContentBlockProps, Work, Media, Post } from '@/payload-types'
import type { Theme } from '@/providers/Theme'

import { CMSLink } from '../../components/Link'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock, type SliderBlockProps } from '../Slider/Component'
import { WorkCard } from '@/components/Card/Works/Component'
import { PostCard } from '@/components/Card/Posts/Component'
import { useTheme } from '@/providers/Theme'

import RichText from '@/components/RichText'

const filterIntroContent = (introContent: any): SliderBlockProps['introContent'] | undefined => {
  if (!introContent) return undefined

  const filtered: Record<string, any> = {}

  if (introContent.heading) filtered.heading = introContent.heading
  if (introContent.subheading) filtered.subheading = introContent.subheading
  if (introContent.size) filtered.size = introContent.size
  if (introContent.align) filtered.align = introContent.align

  return Object.keys(filtered).length > 0
    ? (filtered as SliderBlockProps['introContent'])
    : undefined
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, theme, space, containerWidth } = props
  const { theme: siteTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const effectiveTheme = (() => {
    if (!mounted) return 'light' // Default for SSR
    if (theme === 'system' || !theme) {
      return (siteTheme || 'light') as Theme
    }
    return theme as Theme
  })()

  const getSpacingClasses = (space?: ContentBlockProps['space']) => {
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

  const spacingClasses = getSpacingClasses(space)
  const isFullWidth = containerWidth === 'fullWidth'

  return (
    <div
      data-theme={effectiveTheme}
      className={cn(
        'theme-transition w-full',
        spacingClasses,
        effectiveTheme === 'dark'
          ? 'bg-primary text-primary-foreground font-light'
          : 'bg-background text-foreground',
      )}
    >
      <div
        className={cn(
          'grid grid-cols-4 gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-12',
          isFullWidth ? 'w-full' : 'container',
        )}
      >
        {columns?.map((col, index) => {
          if (!col) return null
          const { sizes, content } = col

          return (
            <div
              className={cn('col-span-4', {
                'lg:col-span-4': sizes === 'oneThird',
                'lg:col-span-6': sizes === 'half',
                'lg:col-span-8': sizes === 'twoThirds',
                'lg:col-span-12': sizes === 'full',
                'lg:col-span-5': sizes === 'fiveCols',
                'md:col-span-4': sizes !== 'full' && sizes !== 'twoThirds',
              })}
              key={index}
            >
              {content === 'work' && col.work?.works && (
                <WorkCard
                  doc={col.work.works as Work}
                  className={cn({
                    'text-primary-foreground': effectiveTheme === 'dark',
                  })}
                />
              )}

              {content === 'post' && col.post?.posts && (
                <PostCard
                  doc={col.post.posts as Post}
                  className={cn({
                    'text-primary-foreground': effectiveTheme === 'dark',
                  })}
                />
              )}

              {content === 'text' && col.text?.richText && (
                <RichText
                  data={col.text.richText}
                  enableGutter={false}
                  className={cn('prose-blocks', {
                    'text-size-sm': col.text.textSize === 'sm',
                    'text-size-base': col.text.textSize === 'base' || !col.text.textSize,
                    'text-size-lg': col.text.textSize === 'lg',
                    'text-size-xl': col.text.textSize === 'xl',
                    'text-size-2xl': col.text.textSize === '2xl',
                  })}
                />
              )}

              {content === 'sectionHeading' && col.sectionHeading?.content && (
                <div
                  className={cn('section-heading-wrapper', {
                    'text-left': col.sectionHeading.align === 'left',
                    'text-center': col.sectionHeading.align === 'center',
                  })}
                >
                  {col.sectionHeading.eyebrow && (
                    <p
                      className={cn('text-accent mb-4', {
                        'section-heading-base':
                          col.sectionHeading.size === 'base' || !col.sectionHeading.size,
                        'section-heading-lg': col.sectionHeading.size === 'lg',
                        'section-heading-xl': col.sectionHeading.size === 'xl',
                      })}
                    >
                      {col.sectionHeading.eyebrow}
                    </p>
                  )}
                  {col.sectionHeading.content && (
                    <RichText
                      data={col.sectionHeading.content}
                      enableGutter={false}
                      className={cn('prose-blocks', {
                        'text-primary-foreground': effectiveTheme === 'dark',
                        'section-heading-base':
                          col.sectionHeading.size === 'base' || !col.sectionHeading.size,
                        'section-heading-lg': col.sectionHeading.size === 'lg',
                        'section-heading-xl': col.sectionHeading.size === 'xl',
                      })}
                    />
                  )}
                </div>
              )}

              {content === 'media' && col.media?.media && (
                <MediaBlock
                  blockType="mediaBlock"
                  media={col.media.media as Media}
                  aspectRatio={col.media.aspectRatio || undefined}
                  fullWidth={isFullWidth && sizes === 'full'}
                />
              )}

              {content === 'slider' && col.slider?.slides && (
                <div className={sizes === 'full' ? 'w-full' : undefined}>
                  <SliderBlock
                    blockType="slider"
                    slides={col.slider.slides as any}
                    style={col.slider.style || undefined}
                    className="py-0"
                    theme={effectiveTheme}
                    introContent={filterIntroContent(col.slider.introContent)}
                    fullWidth={isFullWidth && sizes === 'full'}
                  />
                </div>
              )}

              {content === 'text' && col.text?.enableLink && col.text?.link && (
                <CMSLink
                  {...col.text.link}
                  className={cn({
                    'text-primary-foreground hover:text-primary-foreground/80':
                      effectiveTheme === 'dark',
                  })}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

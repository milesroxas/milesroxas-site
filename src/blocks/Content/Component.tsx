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
import { useSpacing, type SpaceProps } from '@/hooks/useSpacing'

import RichText from '@/components/RichText'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, theme, space, containerWidth } = props
  const { theme: siteTheme } = useTheme()

  const effectiveTheme = (() => {
    if (theme === 'system' || !theme) {
      return (siteTheme || 'light') as Theme
    }
    return theme as Theme
  })()

  const isFullWidth = containerWidth === 'fullWidth'
  const bgClasses = cn('theme-transition w-full', {
    'bg-primary text-primary-foreground font-light ': effectiveTheme === 'dark',
    'bg-background text-foreground': effectiveTheme !== 'dark',
  })

  const spacingStyles = useSpacing(space)

  return (
    <div data-theme={effectiveTheme} className={bgClasses}>
      <div style={spacingStyles}>
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
                    className={cn({
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
                    fullWidth={col.media.fullWidth || (isFullWidth && sizes === 'full')}
                    captionSize={col.media.captionSize || 'normal'}
                    theme={effectiveTheme}
                  />
                )}

                {content === 'slider' && col.slider?.slides && (
                  <div className={sizes === 'full' ? 'w-full' : undefined}>
                    <SliderBlock
                      blockType="slider"
                      slides={col.slider.slides as SliderBlockProps['slides']}
                      style={col.slider.style || undefined}
                      className="py-0"
                      theme={effectiveTheme}
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
    </div>
  )
}

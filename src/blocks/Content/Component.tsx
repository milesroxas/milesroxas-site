'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import type {
  ContentBlock as ContentBlockProps,
  Work,
  Media,
  Post,
  SliderBlock as SliderBlockType,
} from '@/payload-types'

import { useBlockTheme } from '@/hooks/useBlockTheme'
import { useSpacing } from '@/hooks/useSpacing'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { WorkCard } from '@/components/Card/Works/Component'
import { PostCard } from '@/components/Card/Posts/Component'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'

export const ContentBlock: React.FC<ContentBlockProps> = ({
  columns,
  theme: themeOption,
  space,
  containerWidth,
}) => {
  // resolve CMS value (which may be null/undefined) into "light" or "dark"
  const appliedTheme = useBlockTheme(themeOption)

  const isFullWidth = containerWidth === 'fullWidth'
  const spacingStyles = useSpacing(space)

  return (
    <div data-theme={appliedTheme} className="font-light">
      <div style={spacingStyles} className="bg-background text-foreground font-light">
        <div
          className={cn(
            'grid grid-cols-4 gap-x-10 md:grid-cols-2 lg:grid-cols-12',
            isFullWidth ? 'w-full' : 'container',
          )}
        >
          {columns?.map((col, idx) => {
            if (!col) return null
            const { sizes, content } = col

            const colClass = cn('col-span-4', {
              'lg:col-span-4': sizes === 'oneThird',
              'lg:col-span-6': sizes === 'half',
              'lg:col-span-8': sizes === 'twoThirds',
              'lg:col-span-12': sizes === 'full',
              'lg:col-span-5': sizes === 'fiveCols',
              'md:col-span-4': sizes !== 'full' && sizes !== 'twoThirds',
            })

            return (
              <div className={colClass} key={idx}>
                {content === 'work' && col.work?.works && <WorkCard doc={col.work.works as Work} />}

                {content === 'post' && col.post?.posts && <PostCard doc={col.post.posts as Post} />}

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
                          'section-heading-xl':
                            col.sectionHeading.size === 'xl' &&
                            col.sectionHeading.align === 'center',
                        })}
                      >
                        {col.sectionHeading.eyebrow}
                      </p>
                    )}
                    <RichText
                      data={col.sectionHeading.content}
                      enableGutter={false}
                      className={cn('prose-blocks', {
                        'section-heading-base':
                          col.sectionHeading.size === 'base' || !col.sectionHeading.size,
                        'section-heading-lg': col.sectionHeading.size === 'lg',
                        'section-heading-xl': col.sectionHeading.size === 'xl',
                        'max-w-3xl text-center':
                          col.sectionHeading.size === 'xl' && col.sectionHeading.align === 'center',
                      })}
                    />
                  </div>
                )}

                {content === 'media' && col.media?.media && (
                  <MediaBlock
                    blockType="mediaBlock"
                    media={col.media.media as Media}
                    aspectRatio={col.media.aspectRatio}
                    fullWidth={col.media.fullWidth || (isFullWidth && sizes === 'full')}
                    theme={appliedTheme}
                    imgClassName="rounded-md overflow-hidden"
                  />
                )}

                {content === 'slider' && col.slider?.slides && (
                  <div className={sizes === 'full' ? 'w-full' : undefined}>
                    <SliderBlock
                      blockType="slider"
                      slides={col.slider.slides as SliderBlockType['slides']}
                      style={col.slider.style}
                      className="py-0"
                      theme={appliedTheme}
                      fullWidth={isFullWidth && sizes === 'full'}
                    />
                  </div>
                )}

                {content === 'text' && col.text?.enableLink && col.text?.link && (
                  <CMSLink
                    {...col.text.link}
                    className={cn({
                      'text-primary-foreground hover:text-primary-foreground/80':
                        appliedTheme === 'dark',
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

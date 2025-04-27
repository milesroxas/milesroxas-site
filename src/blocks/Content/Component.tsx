import { cn } from '@/utilities/ui'
import React from 'react'

import type { ContentBlock as ContentBlockProps, Work, Media, Post } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'
import { WorkCard } from '@/components/Card/Works/Component'
import { PostCard } from '@/components/Card/Posts/Component'

import RichText from '@/components/RichText'
export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, theme, space } = props

  // Calculate theme and spacing on the server
  const sectionTheme = theme || 'light'

  const getSpacingClasses = (space?: ContentBlockProps['space']) => {
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

  const spacingClasses = getSpacingClasses(space)

  return (
    <div
      className={cn(spacingClasses, {
        'text-foreground': sectionTheme === 'light',
        'bg-primary text-primary-foreground font-light': sectionTheme === 'dark',
      })}
    >
      <div className="container grid grid-cols-4 gap-4 md:grid-cols-4 lg:grid-cols-12">
        {columns?.map((col, index) => {
          if (!col) return null
          const { size, content } = col

          return (
            <div
              className={cn('col-span-4', {
                'lg:col-span-4': size === 'oneThird',
                'lg:col-span-6': size === 'half',
                'lg:col-span-8': size === 'twoThirds',
                'lg:col-span-12': size === 'full',
                'md:col-span-2': size !== 'full',
              })}
              key={index}
            >
              {content === 'work' && col.work?.works && (
                <WorkCard
                  doc={col.work.works as Work}
                  className={cn({
                    'text-primary-foreground': sectionTheme === 'dark',
                  })}
                />
              )}

              {content === 'post' && col.post?.posts && (
                <PostCard
                  doc={col.post.posts as Post}
                  className={cn({
                    'text-primary-foreground': sectionTheme === 'dark',
                  })}
                />
              )}

              {content === 'text' && col.text?.richText && <RichText data={col.text.richText} />}

              {content === 'sectionHeading' && col.sectionHeading?.heading && (
                <div
                  className={cn('text-center', {
                    'text-left': col.sectionHeading.align === 'left',
                  })}
                >
                  {col.sectionHeading.subheading && (
                    <p
                      className={cn('font-light text-orange-600 uppercase', {
                        'text-sm': col.sectionHeading.size === 'base',
                        'text-xl': col.sectionHeading.size === 'lg',
                        'text-2xl': col.sectionHeading.size === 'xl',
                      })}
                    >
                      {col.sectionHeading.subheading}
                    </p>
                  )}
                  <p
                    className={cn('text-2xl font-light', {
                      'text-center': col.sectionHeading.align === 'center',
                      'text-left': col.sectionHeading.align === 'left',
                      'text-2xl/8': col.sectionHeading.size === 'base',
                      'text-3xl/12': col.sectionHeading.size === 'lg',
                      'text-4xl/12': col.sectionHeading.size === 'xl',
                      'mb-4': col.sectionHeading.subheading,
                    })}
                  >
                    {col.sectionHeading.heading}
                  </p>
                </div>
              )}

              {content === 'media' && col.media?.media && (
                <MediaBlock
                  blockType="mediaBlock"
                  media={col.media.media as Media}
                  enableGutter={false}
                  aspectRatio={col.media.aspectRatio || undefined}
                />
              )}

              {content === 'slider' && col.slider?.slides && (
                <SliderBlock
                  blockType="slider"
                  slides={col.slider.slides as any}
                  style={col.slider.style || undefined}
                  className="py-0"
                />
              )}

              {content === 'text' && col.text?.enableLink && col.text?.link && (
                <CMSLink
                  {...col.text.link}
                  className={cn({
                    'text-primary-foreground hover:text-primary-foreground/80':
                      sectionTheme === 'dark',
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

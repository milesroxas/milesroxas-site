import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { ArchiveBlock } from '../ArchiveBlock/Component'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, theme, space } = props

  // Use the theme from the content block props
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

  return (
    <div
      className={cn(getSpacingClasses(space), {
        'text-foreground': sectionTheme === 'light',
        'bg-primary text-primary-foreground font-light': sectionTheme === 'dark',
      })}
    >
      <div className="container">
        <div className="grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { size, contentType } = col
              // Use a type assertion to tell TypeScript the column has these fields
              const column = col as any

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
                  {contentType === 'text' && column.text?.richText && (
                    <RichText
                      data={column.text.richText}
                      enableGutter={false}
                      className={cn({
                        'prose-invert': sectionTheme === 'dark',
                      })}
                    />
                  )}
                  {contentType === 'sectionHeading' && column.sectionHeading?.heading && (
                    <div
                      className={cn('text-center', {
                        'text-left': column.sectionHeading.align === 'left',
                      })}
                    >
                      <p
                        className={cn('text-2xl font-light', {
                          'text-center': column.sectionHeading.align === 'center',
                          'text-left': column.sectionHeading.align === 'left',
                          'text-2xl/8': column.sectionHeading.size === 'base',
                          'text-3xl/12': column.sectionHeading.size === 'lg',
                          'text-4xl/12': column.sectionHeading.size === 'xl',
                          'mb-4': column.sectionHeading.subheading,
                        })}
                      >
                        {column.sectionHeading.heading}
                      </p>
                      {column.sectionHeading.subheading && (
                        <p
                          className={cn('text-2xl font-light', {
                            'text-lg': column.sectionHeading.size === 'base',
                            'text-xl': column.sectionHeading.size === 'lg',
                            'text-2xl': column.sectionHeading.size === 'xl',
                          })}
                        >
                          {column.sectionHeading.subheading}
                        </p>
                      )}
                    </div>
                  )}
                  {contentType === 'archive' && column.archive?.archive && (
                    <ArchiveBlock
                      blockType="archive"
                      populateBy="selection"
                      selectedDocs={column.archive.archive.map((item: any) => ({
                        relationTo: 'posts',
                        value: item,
                      }))}
                    />
                  )}
                  {contentType === 'media' && column.media?.media && (
                    <MediaBlock
                      blockType="mediaBlock"
                      media={column.media.media}
                      enableGutter={false}
                      aspectRatio={column.media.aspectRatio}
                    />
                  )}
                  {contentType === 'slider' && column.slider?.slides && (
                    <SliderBlock
                      blockType="slider"
                      slides={column.slider.slides}
                      style={column.slider.style}
                      className="py-0"
                    />
                  )}
                  {contentType === 'text' && column.text?.enableLink && column.text?.link && (
                    <CMSLink
                      {...column.text.link}
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
    </div>
  )
}

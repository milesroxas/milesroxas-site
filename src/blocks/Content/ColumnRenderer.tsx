'use client'

import type React from 'react'
import { PostCard } from '@/components/Card/Posts/Component'
import { WorkCard } from '@/components/Card/Works/Component'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { ContentBlock, Post, SliderBlock as SliderBlockType, Work } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'
import {
  getSectionHeadingAlignClasses,
  getSectionHeadingSizeClasses,
  getTextSizeClasses,
} from './utils'

type Column = NonNullable<ContentBlock['columns']>[number]

interface ColumnRendererProps {
  column: Column
  appliedTheme: string
  isFullWidth: boolean
  sizes: Column['sizes']
}

export const ColumnRenderer: React.FC<ColumnRendererProps> = ({
  column,
  appliedTheme,
  isFullWidth,
  sizes,
}) => {
  const { content } = column

  // Render Work Card
  if (content === 'work' && column.work?.works) {
    return <WorkCard doc={column.work.works as Work} />
  }

  // Render Post Card
  if (content === 'post' && column.post?.posts) {
    return <PostCard doc={column.post.posts as Post} />
  }

  // Render Rich Text
  if (content === 'text' && column.text?.richText) {
    return (
      <>
        <RichText
          data={column.text.richText}
          enableGutter={false}
          className={cn('prose-blocks', getTextSizeClasses(column.text.textSize))}
        />
        {column.text.enableLink && column.text.link && (
          <CMSLink
            {...column.text.link}
            className={cn({
              'text-primary-foreground hover:text-primary-foreground/80': appliedTheme === 'dark',
            })}
          />
        )}
      </>
    )
  }

  // Render Section Heading
  if (content === 'sectionHeading' && column.sectionHeading?.content) {
    const { align, eyebrow, size, content: sectionContent } = column.sectionHeading

    return (
      <div className={getSectionHeadingAlignClasses(align)}>
        {eyebrow && (
          <p className={cn('text-accent mb-4', getSectionHeadingSizeClasses(size, align))}>
            {eyebrow}
          </p>
        )}
        <RichText
          data={sectionContent}
          enableGutter={false}
          className={cn('prose-blocks', getSectionHeadingSizeClasses(size, align))}
        />
      </div>
    )
  }

  // Render Media
  if (content === 'media' && column.media?.media) {
    return (
      <MediaBlock
        blockType="mediaBlock"
        media={column.media.media}
        aspectRatio={column.media.aspectRatio}
        fullWidth={column.media.fullWidth || (isFullWidth && sizes === 'full')}
        theme={appliedTheme as 'system' | 'light' | 'dark' | null | undefined}
        space={{ pt: null, pb: null, mt: null, mb: null }}
      />
    )
  }

  // Render Slider
  if (content === 'slider' && column.slider?.slides) {
    return (
      <div className={sizes === 'full' ? 'w-full' : undefined}>
        <SliderBlock
          blockType="slider"
          slides={column.slider.slides as SliderBlockType['slides']}
          style={column.slider.style}
          className="py-0"
          theme={appliedTheme as 'system' | 'light' | 'dark' | null | undefined}
          fullWidth={isFullWidth && sizes === 'full'}
        />
      </div>
    )
  }

  return null
}

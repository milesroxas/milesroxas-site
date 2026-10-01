'use client'

import type React from 'react'
import { PostCard } from '@/components/Card/Posts/Component'
import { WorkCard } from '@/components/Card/Works/Component'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText/Legacy'
import type { ContentBlock, Post, SliderBlock as SliderBlockType, Work } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'
import {
  getSectionHeadingAlignClasses,
  getSectionHeadingSizeClasses,
  getTextSizeClasses,
} from './utils'
import { YouTubeColumn } from './YouTubeColumn'

type Column = NonNullable<ContentBlock['columns']>[number]

interface ColumnRendererProps {
  column: Column
  theme: ContentBlock['theme']
  isFullWidth: boolean
  sizes: Column['sizes']
}

const renderWorkCard = (works: Work) => <WorkCard doc={works} />

const renderPostCard = (posts: Post) => <PostCard doc={posts} />

const renderRichText = (text: Column['text']) => {
  if (!text?.richText) return null

  return (
    <>
      <RichText
        data={text.richText}
        enableGutter={false}
        className={cn('prose-blocks', getTextSizeClasses(text.textSize))}
      />
      {text.enableLink && text.link && (
        <CMSLink
          {...text.link}
          className="dark:text-primary-foreground dark:hover:text-primary-foreground/80"
        />
      )}
    </>
  )
}

const renderSectionHeading = (sectionHeading: Column['sectionHeading']) => {
  if (!sectionHeading?.content) return null

  const { align, eyebrow, size, content: sectionContent } = sectionHeading

  return (
    <div className={getSectionHeadingAlignClasses(align)}>
      {eyebrow && (
        <p className={cn('mb-4 text-accent', getSectionHeadingSizeClasses(size, align))}>
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

const renderMedia = (
  media: Column['media'],
  theme: ContentBlock['theme'],
  isFullWidth: boolean,
  sizes: Column['sizes'],
) => {
  if (!media?.media) return null

  return (
    <MediaBlock
      blockType="mediaBlock"
      media={media.media}
      aspectRatio={media.aspectRatio}
      fullWidth={media.fullWidth || (isFullWidth && sizes === 'full')}
      theme={theme}
      space={{ pt: null, pb: null, mt: null, mb: null }}
    />
  )
}

const renderSlider = (
  slider: Column['slider'],
  theme: ContentBlock['theme'],
  isFullWidth: boolean,
  sizes: Column['sizes'],
) => {
  if (!slider?.slides) return null

  return (
    <div className={sizes === 'full' ? 'w-full' : undefined}>
      <SliderBlock
        blockType="slider"
        slides={slider.slides as SliderBlockType['slides']}
        style={slider.style}
        className="py-0"
        theme={theme}
        fullWidth={isFullWidth && sizes === 'full'}
      />
    </div>
  )
}

const renderYouTube = (
  youTube: Column['youTube'],
  isFullWidth: boolean,
  sizes: Column['sizes'],
) => {
  if (!youTube?.url) return null

  return (
    <YouTubeColumn
      blockType="youTube"
      url={youTube.url}
      aspectRatio={youTube.aspectRatio}
      fullWidth={youTube.fullWidth || (isFullWidth && sizes === 'full')}
    />
  )
}

export const ColumnRenderer: React.FC<ColumnRendererProps> = ({
  column,
  theme,
  isFullWidth,
  sizes,
}) => {
  const { content } = column

  if (content === 'work' && column.work?.works) {
    return renderWorkCard(column.work.works as Work)
  }

  if (content === 'post' && column.post?.posts) {
    return renderPostCard(column.post.posts as Post)
  }

  if (content === 'text') {
    return renderRichText(column.text)
  }

  if (content === 'sectionHeading') {
    return renderSectionHeading(column.sectionHeading)
  }

  if (content === 'media') {
    return renderMedia(column.media, theme, isFullWidth, sizes)
  }

  if (content === 'slider') {
    return renderSlider(column.slider, theme, isFullWidth, sizes)
  }

  if (content === 'youTube') {
    return renderYouTube(column.youTube, isFullWidth, sizes)
  }

  return null
}

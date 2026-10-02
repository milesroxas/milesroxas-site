'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import { sectionThemeClass } from '@/blocks/shared/band-theme'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText/LegacyBase'
import { type SpaceProps, useSpacing } from '@/hooks/useSpacing'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

const TEXT_SIZE_CLASS: Record<NonNullable<MediaBlockProps['textSize']>, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

const mediaClasses = ({
  aspectRatio,
  captionLayout,
  fullWidth,
}: Pick<MediaBlockProps, 'aspectRatio' | 'captionLayout' | 'fullWidth'>) => {
  const useAspectRatio = aspectRatio !== 'original'
  const isSplit = captionLayout === 'split-left' || captionLayout === 'split-right'
  const fillsFrame = useAspectRatio && !isSplit

  return {
    fill: fillsFrame,
    frame: cn('mx-auto overflow-hidden rounded-md', {
      'w-full': !isSplit,
      'overflow-hidden': true,
      relative: useAspectRatio,
      'flex flex-col items-start gap-6 md:flex-row': captionLayout === 'split-left',
      'flex flex-col items-start gap-6 md:flex-row-reverse': captionLayout === 'split-right',
      'aspect-square': fillsFrame && aspectRatio === 'square',
      'aspect-[4/5]': fillsFrame && aspectRatio === 'portrait',
      'aspect-[16/9]': fillsFrame && aspectRatio === 'landscape',
      'mx-auto flex max-w-full justify-center': !useAspectRatio && !isSplit,
    }),
    image: cn({
      'overflow-hidden rounded-md': !fullWidth,
      'h-full w-full overflow-hidden rounded-md': fillsFrame,
      'w-full': !useAspectRatio && !isSplit,
      'flex-1': isSplit,
      'h-auto': !useAspectRatio,
      'object-cover': useAspectRatio,
      'object-contain': !useAspectRatio,
    }),
    isSplit,
    video: cn({
      'overflow-hidden rounded-md': !fullWidth,
      'h-full w-full overflow-hidden rounded-md': fillsFrame,
      'w-full md:min-w-0 md:flex-grow': isSplit,
      'h-auto': !useAspectRatio,
      'object-cover': useAspectRatio,
      'object-contain': !useAspectRatio,
    }),
  }
}

const MediaCaption: React.FC<Pick<MediaBlockProps, 'richText' | 'textSize'>> = ({
  richText,
  textSize,
}) => (
  <RichText
    data={richText as DefaultTypedEditorState}
    enableProse={false}
    enableGutter={false}
    className={cn('prose-blocks w-full', textSize && TEXT_SIZE_CLASS[textSize])}
  />
)

const CaptionBelow: React.FC<
  Pick<MediaBlockProps, 'captionLayout' | 'fullWidth' | 'richText' | 'textSize'>
> = ({ captionLayout, fullWidth, richText, textSize }) => (
  <div
    className={cn({
      'container mx-auto': fullWidth,
      'w-full': true,
    })}
  >
    <div
      className={cn('mt-6 max-w-lg', {
        'text-left': captionLayout === 'left',
        'mr-0 ml-auto': captionLayout === 'right',
        'mx-auto text-center': captionLayout === 'center',
      })}
    >
      <MediaCaption richText={richText} textSize={textSize} />
    </div>
  </div>
)

export const MediaBlock: React.FC<MediaBlockProps> = (props) => {
  const {
    aspectRatio = 'landscape',
    fullWidth = false,
    space,
    theme,
    showCaption,
    captionLayout = 'center',
    id,
    richText,
    textSize,
    media,
  } = props

  const classes = mediaClasses({ aspectRatio, captionLayout, fullWidth })

  const spacingStyles = useSpacing(space as SpaceProps)

  return (
    <div className={cn(sectionThemeClass(theme), 'w-full font-light')} id={`block-${id}`}>
      <div style={spacingStyles}>
        <div className="mx-0 w-full">
          <div
            className={cn({
              container: !fullWidth,
              'w-full': true,
            })}
          >
            <div className={classes.frame}>
              <Media
                imgClassName={classes.image}
                videoClassName={classes.video}
                fill={classes.fill}
                resource={media}
                size={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 80vw'}
                priority={true}
              />

              {showCaption && classes.isSplit && (
                <div className="mt-6 w-full self-start md:mt-0 md:w-80 md:shrink-0">
                  <MediaCaption richText={richText} textSize={textSize} />
                </div>
              )}
            </div>

            {showCaption && !classes.isSplit && (
              <CaptionBelow
                captionLayout={captionLayout}
                fullWidth={fullWidth}
                richText={richText}
                textSize={textSize}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

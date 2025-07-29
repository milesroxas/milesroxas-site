'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { Media } from '@/components/Media'

import { useSpacing, SpaceProps } from '@/hooks/useSpacing'

export const MediaBlock: React.FC<MediaBlockProps> = (props) => {
  const {
    aspectRatio = 'landscape',
    fullWidth = false,
    space,
    theme = 'dark',
    showCaption,
    captionLayout = 'center',
    id,
    richText,
    textSize,
    media,
  } = props

  const useAspectRatio = aspectRatio !== 'original'

  const spacingStyles = useSpacing(space as SpaceProps)

  return (
    <div data-theme={theme} className={cn('w-full font-light', {})} id={`block-${id}`}>
      <div style={spacingStyles} className="bg-background text-foreground">
        <div
          className={cn('bg-background text-foreground', {
            'w-full': true,
            'mx-0': true,
          })}
        >
          <div
            className={cn({
              container: !fullWidth,
              'w-full': true,
            })}
          >
            <div
              className={cn('mx-auto overflow-hidden rounded-md', {
                'w-full': captionLayout !== 'split-left' && captionLayout !== 'split-right',
                'overflow-hidden': true,
                relative: useAspectRatio,
                'flex flex-col items-start gap-6 md:flex-row': captionLayout === 'split-left',
                'flex flex-col items-start gap-6 md:flex-row-reverse':
                  captionLayout === 'split-right',
                'aspect-square':
                  useAspectRatio &&
                  aspectRatio === 'square' &&
                  captionLayout !== 'split-left' &&
                  captionLayout !== 'split-right',
                'aspect-[4/5]':
                  useAspectRatio &&
                  aspectRatio === 'portrait' &&
                  captionLayout !== 'split-left' &&
                  captionLayout !== 'split-right',
                'aspect-[16/9]':
                  useAspectRatio &&
                  aspectRatio === 'landscape' &&
                  captionLayout !== 'split-left' &&
                  captionLayout !== 'split-right',
                'mx-auto flex max-w-full justify-center':
                  !useAspectRatio &&
                  captionLayout !== 'split-left' &&
                  captionLayout !== 'split-right',
              })}
            >
              <Media
                imgClassName={cn({
                  'rounded-md overflow-hidden': !fullWidth,
                  'w-full h-full overflow-hidden rounded-md':
                    useAspectRatio &&
                    captionLayout !== 'split-left' &&
                    captionLayout !== 'split-right',
                  'w-full':
                    !useAspectRatio &&
                    captionLayout !== 'split-left' &&
                    captionLayout !== 'split-right',
                  'flex-1': captionLayout === 'split-left' || captionLayout === 'split-right',
                  'h-auto': !useAspectRatio,
                  'object-cover': useAspectRatio,
                  'object-contain': !useAspectRatio,
                })}
                videoClassName={cn({
                  'rounded-md overflow-hidden': !fullWidth,
                  'w-full h-full overflow-hidden rounded-md':
                    useAspectRatio &&
                    captionLayout !== 'split-left' &&
                    captionLayout !== 'split-right',
                  'w-full md:min-w-0 md:flex-grow':
                    captionLayout === 'split-left' || captionLayout === 'split-right',
                  'h-auto': !useAspectRatio,
                  'object-cover': useAspectRatio,
                  'object-contain': !useAspectRatio,
                })}
                fill={
                  useAspectRatio &&
                  captionLayout !== 'split-left' &&
                  captionLayout !== 'split-right'
                }
                resource={media}
                size={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 80vw'}
                priority={true}
              />

              {showCaption &&
                (captionLayout === 'split-left' || captionLayout === 'split-right') && (
                  <div className="mt-6 w-full self-start md:mt-0 md:w-80 md:shrink-0">
                    <RichText
                      data={richText as DefaultTypedEditorState}
                      enableProse={false}
                      enableGutter={false}
                      className={cn('prose-blocks w-full', {
                        'text-lg': textSize === 'lg',
                        'text-xl': textSize === 'xl',
                        'text-2xl': textSize === '2xl',
                        'text-sm': textSize === 'sm',
                        'text-base': textSize === 'base',
                      })}
                    />
                  </div>
                )}
            </div>

            {showCaption && captionLayout !== 'split-left' && captionLayout !== 'split-right' && (
              <div
                className={cn('mt-6 max-w-xl', {
                  'text-left': captionLayout === 'left',
                  'mr-0 ml-auto': captionLayout === 'right',
                  'mx-auto text-center': captionLayout === 'center',
                })}
              >
                <RichText
                  data={richText as DefaultTypedEditorState}
                  enableProse={false}
                  enableGutter={false}
                  className={cn('prose-blocks w-full', {
                    'text-lg': textSize === 'lg',
                    'text-xl': textSize === 'xl',
                    'text-2xl': textSize === '2xl',
                    'text-sm': textSize === 'sm',
                    'text-base': textSize === 'base',
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

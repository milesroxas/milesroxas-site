'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'

import { useSpacing, SpaceProps } from '@/hooks/useSpacing'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
  theme?: 'system' | 'light' | 'dark' | null
  captionSize?: 'normal' | 'large' | 'xl'
  id?: string
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
    aspectRatio = 'landscape',
    fullWidth = false,
    space,
    theme = 'dark',
    captionSize = 'normal',
    id,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const useAspectRatio = aspectRatio !== 'original'

  const spacingStyles = useSpacing(space as SpaceProps)

  return (
    <div data-theme={theme} className={cn('w-full font-light', {})} id={`block-${id}`}>
      <div style={spacingStyles} className="bg-background text-foreground">
        <div
          className={cn(
            'bg-background text-foreground',
            {
              'w-full': true,
              'mx-0': true,
            },
            className,
          )}
        >
          <div
            className={cn({
              'container mx-auto': !fullWidth,
              'w-full': true,
            })}
          >
            <div
              className={cn('mx-auto', {
                'w-full': true,
                'overflow-hidden': true,
                relative: useAspectRatio,
                container: !fullWidth,
                'aspect-square': useAspectRatio && aspectRatio === 'square',
                'aspect-[4/5]': useAspectRatio && aspectRatio === 'portrait',
                'aspect-[16/9]': useAspectRatio && aspectRatio === 'landscape',
                'mx-auto flex max-w-full justify-center': !useAspectRatio,
              })}
            >
              <Media
                imgClassName={cn(imgClassName, {
                  'rounded-[0.2rem]': !fullWidth,
                  'w-full h-full': useAspectRatio,
                  'w-full': !useAspectRatio,
                  'h-auto': !useAspectRatio,
                  'object-cover': useAspectRatio,
                  'object-contain': !useAspectRatio,
                })}
                fill={useAspectRatio}
                resource={media}
                src={staticImage}
                size={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 80vw'}
                priority={true}
              />
            </div>
            {caption && (
              <div
                className={cn(
                  'mt-6',
                  {
                    container: !fullWidth,
                    'mx-auto': fullWidth && !disableInnerContainer,
                    'max-w-[80ch]': fullWidth && !disableInnerContainer,
                    'text-base': captionSize === 'normal',
                    'text-lg': captionSize === 'large',
                    'text-xl': captionSize === 'xl',
                  },
                  captionClassName,
                )}
              >
                <RichText data={caption} enableGutter={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
    aspectRatio = 'landscape',
    fullWidth = false,
    space,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const getSpacingClasses = (space?: MediaBlockProps['space']) => {
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

  // Determine if we should use aspect ratio or let the image maintain its original dimensions
  const useAspectRatio = aspectRatio !== 'original'

  return (
    <div
      className={cn(
        spacingClasses,
        {
          'w-full': true,
          'px-0': fullWidth,
          'mx-0': fullWidth,
          container: enableGutter && !fullWidth,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <div
          className={cn({
            'w-full': true,
            'max-w-none': fullWidth,
            'overflow-hidden': true,
          })}
        >
          <Media
            imgClassName={cn(imgClassName, {
              'aspect-square': useAspectRatio && aspectRatio === 'square',
              'aspect-[4/5]': useAspectRatio && aspectRatio === 'portrait',
              'aspect-[16/9]': useAspectRatio && aspectRatio === 'landscape',
              'rounded-[0.2rem]': !fullWidth,
              'w-full': true,
              'h-auto': !useAspectRatio,
              'object-cover': useAspectRatio,
              'object-contain': !useAspectRatio,
            })}
            resource={media}
            src={staticImage}
            size={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 80vw'}
            priority={true}
          />
        </div>
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: fullWidth && !disableInnerContainer,
              'mx-auto': fullWidth && !disableInnerContainer,
              'max-w-[80ch]': fullWidth && !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}

'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React, { useEffect, useState } from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { Theme, useTheme } from '@/providers/Theme'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
  theme?: 'system' | 'light' | 'dark' | null
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
    theme = 'system',
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const getSpacingClasses = (space?: MediaBlockProps['space']) => {
    if (!space) return {}
    return {
      'pt-0': space.pt === 'none',
      'pt-12': space.pt === 'sm',
      'pt-40': space.pt === 'md',
      'pt-64': space.pt === 'lg',
      'pt-80': space.pt === 'xl',
      'pb-0': space.pb === 'none',
      'pb-12': space.pb === 'sm',
      'pb-40': space.pb === 'md',
      'pb-64': space.pb === 'lg',
      'pb-80': space.pb === 'xl',
      'mt-0': space.mt === 'none',
      'mt-12': space.mt === 'sm',
      'mt-40': space.mt === 'md',
      'mt-64': space.mt === 'lg',
      'mt-80': space.mt === 'xl',
      'mb-0': space.mb === 'none',
      'mb-12': space.mb === 'sm',
      'mb-40': space.mb === 'md',
      'mb-64': space.mb === 'lg',
      'mb-80': space.mb === 'xl',
    }
  }

  const spacingClasses = getSpacingClasses(space)

  // Determine if we should use aspect ratio or let the image maintain its original dimensions
  const useAspectRatio = aspectRatio !== 'original'
  const { theme: siteTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const effectiveTheme = (() => {
    if (!mounted) return 'light' // Default for SSR
    if (theme === 'system' || !theme) {
      // Make sure we handle null/undefined theme properly
      return (siteTheme || 'light') as Theme
    }
    return theme as Theme
  })()

  return (
    <div
      className={cn(
        spacingClasses,
        {
          'w-full': true,
          'mx-0': true,
          'text-primary-foreground': effectiveTheme === 'dark',
        },
        effectiveTheme === 'dark'
          ? 'bg-primary text-primary-foreground font-light'
          : 'bg-background text-foreground',
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
          className={cn({
            'w-full': true,
            'overflow-hidden': true,
            relative: useAspectRatio,
            container: !fullWidth,
            'aspect-square': useAspectRatio && aspectRatio === 'square',
            'aspect-[4/5]': useAspectRatio && aspectRatio === 'portrait',
            'aspect-[16/10]': useAspectRatio && aspectRatio === 'landscape',
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
              },
              captionClassName,
            )}
          >
            <RichText data={caption} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}

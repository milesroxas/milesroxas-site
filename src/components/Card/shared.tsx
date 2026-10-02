'use client'

import type React from 'react'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { useCardTransition } from '@/hooks/useCardTransition'
import type { Media as MediaType } from '@/payload-types'

const aspectRatios = { wide: 16 / 9, portrait: 3 / 4, square: 1 } as const

export type CardAspect = keyof typeof aspectRatios

/** The card's refs and the click handler that runs the card → detail page transition. */
export function useCardLink(href: string, imageRefProp?: React.RefObject<HTMLDivElement | null>) {
  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTransition = useCardTransition({ href, imageRef, scope: containerRef })

  return { containerRef, imageRef, handleTransition }
}

type CardImageProps = {
  aspect: CardAspect
  hero?: { media?: (number | null) | MediaType } | null
  imageRef: React.RefObject<HTMLDivElement | null>
  index?: number
}

/** The hero media in its aspect frame; the transition clones the media out of `imageRef`. */
export function CardImage({ aspect, hero, imageRef, index }: CardImageProps) {
  return (
    <div
      ref={imageRef}
      className="relative mb-6 w-full"
      style={{ aspectRatio: aspectRatios[aspect] }}
    >
      {hero && (
        <Media
          resource={hero.media}
          priority={index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="h-full w-full object-cover"
          imgClassName="rounded-sm overflow-hidden"
          videoClassName="rounded-sm overflow-hidden"
        />
      )}
    </div>
  )
}

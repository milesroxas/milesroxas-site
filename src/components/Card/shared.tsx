'use client'

import type React from 'react'
import { Media } from '@/components/Media'
import { Visual } from '@/components/Visual'
import { resolveOpening, type StoredVisualSlot } from '@/features/immersive/visual'
import { cn } from '@/utilities/ui'

const aspectRatios = { wide: 16 / 9, portrait: 3 / 4, square: 1 } as const

export type CardAspect = keyof typeof aspectRatios

type CardImageProps = {
  aspect: CardAspect
  hero?: StoredVisualSlot | null
  imageRef?: React.RefObject<HTMLDivElement | null>
  index?: number
}

/**
 * The hero's picture in its aspect frame, as the post opening shows it: the
 * upload, else the posters of the effect grounding the hero, one per theme.
 * A work card's morph reads the frame through `imageRef`. The frame wipes
 * open under a `ScrollReveal` ancestor.
 */
export function CardImage({ aspect, hero, imageRef, index }: CardImageProps) {
  const { ground, media, surface } = resolveOpening(hero, { seedKey: 'hero' })
  return (
    <div
      ref={imageRef}
      className="relative mb-6 w-full"
      data-reveal="media"
      style={{ aspectRatio: aspectRatios[aspect] }}
    >
      {media ? (
        <Media
          resource={media}
          priority={index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="h-full w-full object-cover"
          imgClassName="rounded-sm overflow-hidden"
          videoClassName="rounded-sm overflow-hidden"
        />
      ) : (
        ground && (
          // A pinned face paints its own ground, as the opening does.
          <div
            className={cn(
              'absolute inset-0 overflow-hidden rounded-sm',
              surface && 'bg-background',
            )}
            data-theme={surface ?? undefined}
          >
            <Visual
              active={false}
              fill
              placement="card"
              posterClassName="object-cover select-none"
              priority={index === 0}
              size="(min-width: 768px) 50vw, 100vw"
              visual={ground}
            />
          </div>
        )
      )}
    </div>
  )
}

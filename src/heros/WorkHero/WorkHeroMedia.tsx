'use client'

import { useEffect, useState, ViewTransition } from 'react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { clearWorkMorph, isWorkMorph, workMorphName } from './morph'

/**
 * The opening's picture. On a fresh load the frame wipes open downward while
 * the picture settles inside it; arriving from a work card, the card's picture
 * hands off to this frame instead, so neither plays.
 */
export function WorkHeroMedia({ media, slug }: { media: MediaType; slug: string }) {
  const [arrival] = useState(() => (isWorkMorph(slug) ? 'morph' : 'load'))
  useEffect(() => clearWorkMorph(), [])

  return (
    <ViewTransition default="none" name={workMorphName(slug)} share="work-morph">
      <div
        className="relative aspect-[1.6] w-full overflow-clip bg-muted [--enter-at:360ms] data-[arrival=load]:motion-safe:animate-hero-wipe data-[arrival=load]:motion-reduce:animate-hero-fade md:w-[41.25vw]"
        data-arrival={arrival}
        data-hero-media=""
        data-slot="work-hero-media"
      >
        <Media
          fill
          imgClassName="object-cover in-data-[arrival=load]:motion-safe:animate-hero-settle"
          priority
          resource={media}
          size="(min-width: 48rem) 42vw, 100vw"
          videoClassName="in-data-[arrival=load]:motion-safe:animate-hero-settle"
        />
      </div>
    </ViewTransition>
  )
}

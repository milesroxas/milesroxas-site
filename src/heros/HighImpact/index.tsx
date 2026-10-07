// components/HighImpactHero.tsx
'use client'

import type React from 'react'
import { Media } from '@/components/Media'
import { resolveOpening } from '@/features/immersive/visual'
import { HeroGround } from '@/heros/HeroGround'
import { useTransitionClonePickup } from '@/hooks/useTransitionClonePickup'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities/ui'

export const HighImpactHero: React.FC<Page['hero']> = (hero) => {
  const { media } = hero
  // The effect the editor chose to ground the band (composer roadmap, D12).
  // With none, the hero renders exactly as it did before the visual slot.
  const { ground, surface } = resolveOpening(hero, { seedKey: 'hero' })
  const heroRef = useTransitionClonePickup()

  // Over an effect the media blends into it, as sas-site's hero does.
  const mediaClassName = cn(
    'absolute inset-0 w-full h-full object-cover pointer-events-none',
    ground && '-z-20 opacity-85 mix-blend-soft-light',
  )

  return (
    <section
      ref={heroRef}
      className={cn(
        'relative min-h-[65vh] w-full overflow-hidden md:min-h-[82vh]',
        // A ground needs a stacking context with a real ground of its own:
        // its layers sit at negative z, and the media blends over them.
        ground && 'isolate bg-background',
      )}
      data-theme={surface ?? 'dark'}
    >
      {/* full‑bleed background image or video. The FLIP clone lands on the
          first img/video in the hero, so the media stays ahead of the ground. */}
      {media && typeof media === 'object' && (
        <Media
          fill
          imgClassName={mediaClassName}
          videoClassName={mediaClassName}
          priority
          resource={media}
        />
      )}
      <HeroGround className={media ? 'opacity-85' : undefined} ground={ground} />
    </section>
  )
}

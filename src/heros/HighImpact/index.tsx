// components/HighImpactHero.tsx
'use client'

import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { Media } from '@/components/Media'
import { resolveOpening } from '@/features/immersive/visual'
import { HeroGround } from '@/heros/HeroGround'
import type { Page } from '@/payload-types'
import { useChromeStore } from '@/stores/chromeStore'
import { cn } from '@/utilities/ui'

type ChromeState = ReturnType<typeof useChromeStore.getState>

/** If no hero media, just fade the clone out. */
const fadeCloneOut = (
  clone: HTMLElement,
  setChromeVisible: ChromeState['setVisible'],
  setTransitionPhase: ChromeState['setTransitionPhase'],
) => {
  gsap.to(clone, {
    opacity: 0,
    duration: 0.8, // Increased from 0.5
    ease: 'power3.out',
    onComplete: () => {
      clone.remove()
      window.__PAGE_TRANSITION_CLONE = undefined
      setChromeVisible(true)
      setTransitionPhase('frame-ready')
    },
  })
}

/** Shrinks the clone onto the hero's media, then fades it out. */
const landCloneOnMedia = (
  clone: HTMLElement,
  mediaEl: HTMLElement,
  setChromeVisible: ChromeState['setVisible'],
  setTransitionPhase: ChromeState['setTransitionPhase'],
) => {
  const { top, left, width, height } = mediaEl.getBoundingClientRect()

  const tl = gsap.timeline({
    onComplete: () => {
      clone.remove()
      window.__PAGE_TRANSITION_CLONE = undefined
      setTransitionPhase('complete')
    },
  })

  // 1) shrink/move the clone into place
  tl.to(clone, {
    top,
    left,
    width,
    height,
    duration: 1, // Increased from 0.8 to 1.2 for slower animation
    ease: 'power2.inOut', // Changed to power2 for smoother motion
    onUpdate: function () {
      // The chrome comes back once the clone is 70% of the way into the hero
      if (this.progress() > 0.7 && useChromeStore.getState().transitionPhase !== 'frame-ready') {
        setChromeVisible(true)
        setTransitionPhase('frame-ready')
      }
    },
  })
    // 2) then fade it out
    .to(
      clone,
      {
        opacity: 0,
        duration: 0.1, // Increased from 0.3 to 0.6
        ease: 'power1.inOut', // Changed to inOut for smoother fade
      },
      '>-0.1',
    )
}

/** Lands the page-transition clone on the hero's media. Returns the ref for the hero root. */
const useTransitionClonePickup = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const setChromeVisible = useChromeStore((s) => s.setVisible)
  const setTransitionPhase = useChromeStore((s) => s.setTransitionPhase)
  const pathname = usePathname()

  // Pick up the page-transition clone only on arrival at this route (mount or
  // pathname change). Keying this off transition state would re-run it on the
  // source page while the card's exit animation is still in flight.
  // biome-ignore lint/correctness/useExhaustiveDependencies(pathname): pathname re-triggers the pickup when navigating between two pages that share this hero instance
  useEffect(() => {
    const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
    const heroEl = heroRef.current
    if (!clone || !heroEl) return

    // anchor transforms from the page top‑left
    clone.style.transformOrigin = 'top left'

    // find the real <img> so we get its exact position & size
    const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
    if (!mediaEl) {
      fadeCloneOut(clone, setChromeVisible, setTransitionPhase)
      return
    }

    landCloneOnMedia(clone, mediaEl, setChromeVisible, setTransitionPhase)
  }, [setChromeVisible, setTransitionPhase, pathname])

  return heroRef
}

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

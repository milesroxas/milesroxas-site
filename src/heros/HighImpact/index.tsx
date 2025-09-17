// components/HighImpactHero.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import { useSiteFrameStore } from '@/stores/siteframeStore'

export const HighImpactHero: React.FC<Page['hero']> = ({ media }) => {
  const heroRef = useRef<HTMLDivElement>(null)
  const { setIsSiteFrameVisible, setTransitionPhase, transitionPhase } = useSiteFrameStore()

  useEffect(() => {
    const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
    const heroEl = heroRef.current
    if (!clone || !heroEl) return

    // anchor transforms from the page top‑left
    clone.style.transformOrigin = 'top left'

    // find the real <img> so we get its exact position & size
    const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
    if (!mediaEl) {
      // if no hero media, just fade clone out
      gsap.to(clone, {
        opacity: 0,
        duration: 0.8, // Increased from 0.5
        ease: 'power3.out',
        onComplete: () => {
          clone.remove()
          window.__PAGE_TRANSITION_CLONE = undefined
          setIsSiteFrameVisible(true)
          setTransitionPhase('frame-ready')
        },
      })
      return
    }

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
        // Set site frame visible and update transition phase when animation is 70% complete
        if (this.progress() > 0.7 && transitionPhase !== 'frame-ready') {
          setIsSiteFrameVisible(true)
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
  }, [setIsSiteFrameVisible, setTransitionPhase])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[65vh] w-full overflow-hidden md:min-h-[82vh]"
      data-theme="dark"
    >
      {/* full‑bleed background image or video */}
      {media && typeof media === 'object' && (
        <Media
          fill
          imgClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
          videoClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
          priority
          resource={media}
        />
      )}
    </section>
  )
}

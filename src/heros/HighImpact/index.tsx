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
    // Delay to ensure DOM is fully rendered and media elements are positioned
    const handleTransition = () => {
      const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
      const heroEl = heroRef.current
      
      if (!clone || !heroEl) return

      // Ensure clone is visible and properly positioned
      Object.assign(clone.style, {
        transformOrigin: 'center center',
        visibility: 'visible',
        opacity: '1',
        zIndex: '10000',
      })

      // Find the target media element
      const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
      
      if (!mediaEl) {
        // No hero media, fade out clone and restore frame
        gsap.to(clone, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            clone.remove()
            window.__PAGE_TRANSITION_CLONE = undefined
            window.__PAGE_TRANSITION_SCROLL_DATA = undefined
            setIsSiteFrameVisible(true)
            setTransitionPhase('complete')
          },
        })
        return
      }

      // Wait for layout to stabilize before getting target position
      requestAnimationFrame(() => {
        // Get target element position (new page is at scroll 0)
        const targetRect = mediaEl.getBoundingClientRect()
        
        // Target coordinates are viewport-relative (new page starts at scroll 0)
        const targetTop = targetRect.top
        const targetLeft = targetRect.left
        
        // The clone is in fixed position, so target coordinates are viewport-relative
        // No scroll adjustment needed for target since new page starts at scroll 0

        const tl = gsap.timeline({
          onComplete: () => {
            clone.remove()
            window.__PAGE_TRANSITION_CLONE = undefined
            window.__PAGE_TRANSITION_SCROLL_DATA = undefined
            setTransitionPhase('complete')
          },
        })

        // Reset any transforms from the source animation
        gsap.set(clone, { scale: 1 })
        
        // Animate clone to target position with consistent timing
        tl.to(clone, {
          top: `${targetTop}px`,
          left: `${targetLeft}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          duration: 0.7,
          ease: 'power2.inOut',
          onUpdate: function () {
            // Restore site frame when animation is 30% complete
            if (this.progress() > 0.3 && transitionPhase !== 'frame-ready') {
              setIsSiteFrameVisible(true)
              setTransitionPhase('frame-ready')
            }
          },
        })
        // Fade out clone smoothly
        .to(
          clone,
          {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          },
          '>-0.1',
        )
      })
    }

    // Small delay to ensure component is mounted and media is loaded
    const timeoutId = setTimeout(handleTransition, 50)
    return () => clearTimeout(timeoutId)
  }, [setIsSiteFrameVisible, setTransitionPhase, transitionPhase])

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

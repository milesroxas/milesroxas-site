'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Flip from 'gsap/Flip'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useSiteFrameStore } from '@/stores/siteframeStore'

gsap.registerPlugin(Flip, useGSAP)

interface UseCardTransitionArgs {
  href: string
  imageRef: React.RefObject<HTMLDivElement | null>
  scope: React.RefObject<HTMLElement | null>
}

/**
 * Shared card → detail page hero transition.
 * Clones the card media, FLIP-expands it to full screen, then navigates.
 * The destination hero (HighImpact/PostHero) picks up the clone and
 * animates it into place for a seamless entry.
 */
export function useCardTransition({ href, imageRef, scope }: UseCardTransitionArgs) {
  const router = useRouter()
  const { setIsSiteFrameVisible, setIsTransitioning, setTransitionPhase } = useSiteFrameStore()

  const { contextSafe } = useGSAP({ scope })

  return contextSafe((e: React.MouseEvent) => {
    e.preventDefault()

    const containerEl = imageRef.current
    const mediaEl = containerEl?.querySelector('img, video') as HTMLElement | null

    if (!mediaEl) {
      router.push(href)
      return
    }

    setIsTransitioning(true)
    setTransitionPhase('initial')

    // clone & stash for the destination hero to pick up
    const clone = mediaEl.cloneNode(true) as HTMLElement
    clone.classList.add('page-transition-clone')
    window.__PAGE_TRANSITION_CLONE = clone
    document.body.appendChild(clone)

    const rect = mediaEl.getBoundingClientRect()
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      objectFit: 'cover',
      zIndex: '10000',
    })

    // Hide original immediately
    mediaEl.style.visibility = 'hidden'

    // FLIP to full-screen - get initial state first
    const state = Flip.getState(clone)

    Object.assign(clone.style, {
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    })

    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      onStart: () => {
        setTransitionPhase('clone-animating')
      },
      onComplete: () => {
        router.push(href)
        setIsSiteFrameVisible(false)
      },
      onInterrupt: () => {
        router.push(href)
        setIsSiteFrameVisible(false)
      },
    })
  })
}

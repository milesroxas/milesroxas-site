'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Flip from 'gsap/Flip'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useChromeStore } from '@/stores/chromeStore'

gsap.registerPlugin(Flip, useGSAP)

/** Clones the media over itself, fixed in place, and stashes it for the destination hero to pick up. */
function stashClone(mediaEl: HTMLElement): HTMLElement {
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

  return clone
}

interface UseCardTransitionArgs {
  href: string
  imageRef: React.RefObject<HTMLDivElement | null>
  scope: React.RefObject<HTMLElement | null>
}

/**
 * Shared card → detail page hero transition.
 * Clones the card media, FLIP-expands it to full screen, then navigates.
 * The destination hero (HighImpact) picks up the clone and
 * animates it into place for a seamless entry.
 */
export function useCardTransition({ href, imageRef, scope }: UseCardTransitionArgs) {
  const router = useRouter()
  const setChromeVisible = useChromeStore((s) => s.setVisible)
  const setTransitionPhase = useChromeStore((s) => s.setTransitionPhase)

  const { contextSafe } = useGSAP({ scope })

  return contextSafe((e: React.MouseEvent) => {
    e.preventDefault()

    const containerEl = imageRef.current
    const mediaEl = containerEl?.querySelector('img, video') as HTMLElement | null

    if (!mediaEl) {
      router.push(href)
      return
    }

    setTransitionPhase('initial')

    const clone = stashClone(mediaEl)

    // Hide original immediately
    mediaEl.style.visibility = 'hidden'

    const navigate = () => {
      router.push(href)
      setChromeVisible(false)
    }

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
      onComplete: navigate,
      onInterrupt: navigate,
    })
  })
}

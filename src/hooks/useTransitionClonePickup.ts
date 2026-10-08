'use client'

import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { visibleMedia } from '@/hooks/useCardTransition'
import { useChromeStore } from '@/stores/chromeStore'

type ChromeState = ReturnType<typeof useChromeStore.getState>

/** If no hero media, just fade the clone out. */
const fadeCloneOut = (
  clone: HTMLElement,
  setChromeVisible: ChromeState['setVisible'],
  setTransitionPhase: ChromeState['setTransitionPhase'],
) => {
  gsap.to(clone, {
    opacity: 0,
    duration: 0.8,
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

  tl.to(clone, {
    top,
    left,
    width,
    height,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: function () {
      // The chrome comes back once the clone is 70% of the way into the hero
      if (this.progress() > 0.7 && useChromeStore.getState().transitionPhase !== 'frame-ready') {
        setChromeVisible(true)
        setTransitionPhase('frame-ready')
      }
    },
  }).to(clone, { opacity: 0, duration: 0.1, ease: 'power1.inOut' }, '>-0.1')
}

/**
 * Lands the card transition's clone (`useCardTransition`) on the first
 * visible img/video inside the returned ref, or fades it out when there is none.
 */
export function useTransitionClonePickup<T extends HTMLElement = HTMLDivElement>() {
  const heroRef = useRef<T>(null)
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

    clone.style.transformOrigin = 'top left'

    const mediaEl = visibleMedia(heroEl)
    if (!mediaEl) {
      fadeCloneOut(clone, setChromeVisible, setTransitionPhase)
      return
    }

    landCloneOnMedia(clone, mediaEl, setChromeVisible, setTransitionPhase)
  }, [setChromeVisible, setTransitionPhase, pathname])

  return heroRef
}

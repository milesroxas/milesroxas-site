'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type RefObject, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  SCROLL_REVEAL_EXIT_TIME_SCALE as EXIT_TIME_SCALE,
  SCROLL_REVEAL_SWAP,
} from './scroll-reveal'

gsap.registerPlugin(useGSAP)

/**
 * Panel-swap choreography for dropdown-driven blocks. Opacity only, with
 * timings from `SCROLL_REVEAL_SWAP` — not the scroll entrance's mask wipe,
 * which is first-seen language and reads as a replay when a dropdown fires it.
 */
const {
  textDuration: TEXT_DURATION,
  textEase: TEXT_EASE,
  stagger: STAGGER,
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
} = SCROLL_REVEAL_SWAP

const SWAP_TEXT = '[data-swap="text"]'
const SWAP_MEDIA = '[data-swap="media"]'

/** Entrance half: the incoming panel fades in, the root carrying the outgoing height when it differs. */
function playSwapEntrance(root: HTMLElement, fromHeight: number | null, onComplete: () => void) {
  const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
  const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
  const tl = gsap.timeline({ onComplete })
  if (fromHeight !== null && fromHeight !== root.offsetHeight) {
    tl.fromTo(
      root,
      { height: fromHeight },
      {
        height: root.offsetHeight,
        duration: TEXT_DURATION,
        ease: TEXT_EASE,
        clearProps: 'height',
      },
      0,
    )
  }
  if (texts.length) {
    tl.fromTo(
      texts,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: TEXT_DURATION,
        ease: TEXT_EASE,
        stagger: STAGGER,
      },
      0,
    )
  }
  if (media) {
    tl.fromTo(
      media,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: MEDIA_DURATION, ease: MEDIA_EASE },
      0,
    )
  }
  return tl
}

/** Exit half: the current panel fades out, sped up like every swap exit. */
function playSwapExit(root: HTMLElement, onComplete: () => void) {
  const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
  const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
  const tl = gsap.timeline({ onComplete }).timeScale(EXIT_TIME_SCALE)
  if (texts.length) {
    tl.to(
      texts,
      {
        autoAlpha: 0,
        duration: TEXT_DURATION,
        ease: TEXT_EASE,
        stagger: STAGGER,
      },
      0,
    )
  }
  if (media) {
    tl.to(media, { autoAlpha: 0, duration: MEDIA_DURATION, ease: MEDIA_EASE }, 0)
  }
  return tl
}

type RevealSwapOptions = {
  rootRef: RefObject<HTMLElement | null>
  /** Currently rendered panel index; the entrance half keys on its change. */
  active: number
  /** State setter invoked once the exit half finishes. */
  onSwap: (index: number) => void
  /** Fires as the exit half begins — unmount work that must not composite during the fade. */
  onSwapStart?: () => void
  /** Fires once the entrance half has settled (or immediately under reduced motion). */
  onSettled?: () => void
  /** Tween the root's height across the swap (see above). */
  morphHeight?: boolean
}

/**
 * Two-half swap: the current panel's `data-swap` targets fade out (sped up
 * like every swap exit), `onSwap` re-renders the next panel, and the
 * incoming half fades in over the fresh nodes. Reduced motion swaps state
 * directly. Returns the context-safe select function.
 *
 * `morphHeight` also carries the root from the outgoing panel's height to the
 * incoming one's on the entrance half, for a surface whose panels differ in
 * size (a form that becomes its receipt): the surface resizes while its copy
 * is still fading in, rather than snapping in the frame between the halves.
 * The root must clip (`overflow: hidden`); the height is cleared once it lands.
 */
export function useRevealSwap({
  rootRef,
  active,
  onSwap,
  onSwapStart,
  onSettled,
  morphHeight = false,
}: RevealSwapOptions) {
  const swapTlRef = useRef<gsap.core.Timeline | null>(null)
  /** The outgoing panel's height, read as the exit half lands; null when not morphing. */
  const fromHeightRef = useRef<number | null>(null)
  const swappingRef = useRef(false)
  const targetIndexRef = useRef(active)
  /** This render's callbacks, for the timelines that outlive it. */
  const latest = useRef({ onSwapStart, onSettled })
  latest.current = { onSwapStart, onSettled }
  const prefersReducedMotion = usePrefersReducedMotion()

  const { contextSafe } = useGSAP(
    () => {
      // Entrance half of a swap only — the shell's ScrollReveal owns the
      // first entrance, so mount and reduced-motion renders stay untouched.
      if (!swappingRef.current) return
      swappingRef.current = false
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      const fromHeight = fromHeightRef.current
      fromHeightRef.current = null
      swapTlRef.current = playSwapEntrance(root, fromHeight, () => latest.current.onSettled?.())
    },
    { scope: rootRef, dependencies: [active, prefersReducedMotion] },
  )

  return contextSafe((index: number) => {
    if (index === targetIndexRef.current) return
    targetIndexRef.current = index
    latest.current.onSwapStart?.()
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      onSwap(index)
      latest.current.onSettled?.()
      return
    }

    // Exit half: current copy fades out, then the state swap re-renders
    // and the entrance effect above plays.
    swapTlRef.current?.kill()
    swappingRef.current = true
    swapTlRef.current = playSwapExit(root, () => {
      fromHeightRef.current = morphHeight ? (rootRef.current?.offsetHeight ?? null) : null
      onSwap(index)
    })
  })
}

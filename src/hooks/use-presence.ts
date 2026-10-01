'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * An animation that ends on its own clock. A scroll-driven one (a scroll
 * fade on a list inside the element) follows its scroller and an endless
 * loop never stops: neither ever finishes, so waiting on them would keep the
 * element mounted for good.
 */
const endsOnItsOwn = (animation: Animation) =>
  animation.timeline === document.timeline &&
  animation.effect?.getTiming().iterations !== Number.POSITIVE_INFINITY

/**
 * Keeps an element mounted until its CSS exit has finished.
 *
 * The enter is `@starting-style`, the exit is an ordinary transition off
 * `data-open`, so both are interruptible and CSS stays the only timing source.
 * The running transitions are read through `getAnimations` rather than a
 * timer: reduced motion swaps the transition list and nothing here changes.
 * Reopening mid-exit cancels the pending unmount and the transition retargets
 * from where it is.
 *
 * `animating` is true for the length of either run, for a `will-change` that
 * lasts exactly as long as the tween (docs/animations.md).
 */
export function usePresence(ref: RefObject<HTMLElement | null>, open: boolean) {
  const [mounted, setMounted] = useState(open)
  const [animating, setAnimating] = useState(false)
  if (open && !mounted) setMounted(true)

  // `mounted` is a dependency so the enter is observed once the node exists.
  useEffect(() => {
    const element = ref.current
    if (!mounted || !element) return
    // No Web Animations (jsdom, very old engines): nothing to wait for.
    const running =
      typeof element.getAnimations === 'function'
        ? element.getAnimations({ subtree: true }).filter(endsOnItsOwn)
        : []
    let cancelled = false
    const settle = () => {
      if (cancelled) return
      setAnimating(false)
      if (!open) setMounted(false)
    }
    if (running.length === 0) {
      settle()
    } else {
      setAnimating(true)
      Promise.allSettled(running.map((animation) => animation.finished)).then(settle)
    }
    return () => {
      cancelled = true
    }
  }, [ref, open, mounted])

  return { mounted, animating }
}

'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * What the effects' canvases share as overlays on their positioned ancestor:
 * whether one is close enough to the viewport to draw, where the pointer falls
 * in its box, and when its first frame is on screen.
 */

/**
 * Whether the overlay is in (or about to scroll into) view, observed while
 * `enabled`. Off-screen overlays keep their context but stop rendering, so one
 * on a section costs nothing while that section is scrolled away.
 */
export function useOverlayInView(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      // Start rendering just before it scrolls in, so it is never caught mid-fade.
      { rootMargin: '10%' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [enabled, rootRef])
  return inView
}

/** The raw pointer a DOM listener records and a frame maps. */
type OverlayPointer = { clientX: number; clientY: number; moved: boolean; x: number; y: number }

/**
 * Map the last recorded pointer into the overlay's box: 0..1, y-up (GL
 * convention). The rect is read only on frames where the pointer moved, so
 * idle frames cost no layout. Returns whether a new position was mapped.
 */
export function mapOverlayPointer(input: OverlayPointer, root: HTMLElement | null): boolean {
  if (!input.moved) return false
  input.moved = false
  const rect = root?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return false
  input.x = (input.clientX - rect.left) / rect.width
  input.y = 1 - (input.clientY - rect.top) / rect.height
  return true
}

/**
 * Signal the first frame, once per mount. R3F draws after the frame callback
 * returns; the next animation frame is the earliest moment that draw has been
 * issued, so readiness waits for it.
 */
export function signalFirstFrame(framesDrawn: { current: number }, onFirstFrame?: () => void) {
  if (framesDrawn.current !== 0) return
  framesDrawn.current = 1
  if (onFirstFrame) requestAnimationFrame(() => onFirstFrame())
}

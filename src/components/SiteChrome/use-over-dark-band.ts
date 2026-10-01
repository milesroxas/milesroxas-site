'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Bands that flip floating chrome to its dark material: the composition
 * band surface (`themeClasses.dark`) and anything pinned dark, such as a
 * legacy dark block, a hero, or a case study's title bar.
 */
const DARK_BAND_SELECTOR = '.band-dark, [data-theme="dark"]'

/**
 * Floating chrome marks itself `data-chrome` so it never counts as a band:
 * it wears `data-theme="dark"` itself while it floats over one.
 */
const CHROME_SELECTOR = '[data-chrome]'

type BandListener = (bands: Element[]) => void

let bands: Element[] = []
const listeners = new Set<BandListener>()
let observer: MutationObserver | null = null
let frame = 0

const readBands = () =>
  Array.from(document.querySelectorAll(DARK_BAND_SELECTOR)).filter(
    (band) => !band.closest(CHROME_SELECTOR),
  )

const scan = () => {
  frame = 0
  const next = readBands()
  // Most mutations (an animation's class, a hover state) leave the bands as
  // they were; only a changed list re-observes.
  if (next.length === bands.length && next.every((band, index) => band === bands[index])) return
  bands = next
  for (const listener of listeners) listener(bands)
}

/** One rescan per frame, however many nodes a render or a route change touched. */
const scheduleScan = () => {
  if (!frame) frame = requestAnimationFrame(scan)
}

/**
 * Every consumer shares one list of bands and one observer on the document:
 * a route change, a block that mounts late, or a band whose theme is set
 * after hydration all rescan it. A new subscriber always gets the current
 * list at once.
 */
function subscribeBands(listener: BandListener) {
  listeners.add(listener)
  if (!observer) {
    observer = new MutationObserver(scheduleScan)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
      childList: true,
      subtree: true,
    })
    bands = readBands()
  }
  listener(bands)
  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    observer?.disconnect()
    observer = null
    cancelAnimationFrame(frame)
    frame = 0
  }
}

/**
 * True while a dark band sits under the vertical centre of `ref`, a fixed
 * element. The centre becomes a one-pixel line across the viewport (an
 * IntersectionObserver whose root margin leaves only that line), so scrolling
 * costs no scroll handler and no layout read: the browser reports each band
 * as it crosses the line. The line is measured again on resize, since the
 * element's place changes with the breakpoint.
 *
 * `mounted` is for an element that renders after the hook's first run (a
 * portal waiting on the document): flip it once the element exists.
 */
export function useOverDarkBand(ref: RefObject<HTMLElement | null>, mounted = true): boolean {
  const [overDark, setOverDark] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!mounted || !element) return

    const crossing = new Set<Element>()
    let intersection: IntersectionObserver | null = null
    let current: Element[] = []

    const observe = () => {
      intersection?.disconnect()
      crossing.clear()
      const rect = element.getBoundingClientRect()
      const line = Math.round(rect.top + rect.height / 2)
      const below = Math.max(window.innerHeight - line - 1, 0)
      intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) crossing.add(entry.target)
            else crossing.delete(entry.target)
          }
          setOverDark(crossing.size > 0)
        },
        { rootMargin: `-${line}px 0px -${below}px 0px` },
      )
      for (const band of current) intersection.observe(band)
      if (current.length === 0) setOverDark(false)
    }

    const unsubscribe = subscribeBands((next) => {
      current = next
      observe()
    })
    window.addEventListener('resize', observe)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', observe)
      intersection?.disconnect()
    }
  }, [ref, mounted])

  return overDark
}

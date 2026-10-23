'use client'

import { type RefObject, useEffect, useState } from 'react'
import { useSiteTheme } from '@/hooks/use-site-theme'
import type { Theme } from '@/providers/Theme/types'
import { GROUND_SCOPE_SELECTOR, readGround } from '@/utilities/ground'

/**
 * Floating chrome marks itself `data-chrome` so it never counts as a band:
 * it wears the band's polarity as `data-theme` itself while it floats over
 * one.
 */
const CHROME_SELECTOR = '[data-chrome]'

type BandListener = (bands: Element[]) => void

let bands: Element[] = []
const listeners = new Set<BandListener>()
let observer: MutationObserver | null = null
let frame = 0

/**
 * Every scope that can set a ground (a hero, an inverted band, the always-dark
 * panel, a pinned visual), less `<html>`: the page itself is the ground the
 * chrome wears when no band is under it.
 */
const readBands = () =>
  Array.from(document.body.querySelectorAll(GROUND_SCOPE_SELECTOR)).filter(
    (band) => !band.closest(CHROME_SELECTOR),
  )

const scan = () => {
  frame = 0
  const next = readBands()
  // Most mutations (an animation's class, a hover state) leave the bands as
  // they were: the list keeps its identity, and a listener that sees the
  // same list re-observes only if its own line has moved.
  if (!(next.length === bands.length && next.every((band, index) => band === bands[index])))
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
      attributeFilter: ['data-theme', 'data-band', 'class'],
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

/** The innermost of the bands under the line: none of the others sits inside it. */
const innermost = (crossing: Set<Element>) => {
  for (const band of crossing) {
    let holdsAnother = false
    for (const other of crossing) {
      if (other !== band && band.contains(other)) {
        holdsAnother = true
        break
      }
    }
    if (!holdsAnother) return band
  }
  return undefined
}

/**
 * The polarity of the band under the vertical centre of `ref`, a fixed
 * element, or undefined over the page itself. A band is any ground scope (a
 * hero, an inverted Section, the always-dark panel), and its polarity is the
 * stylesheet's call (`readGround`), so an inverted band reads dark on a light
 * visit and light on a dark one.
 *
 * The centre becomes a one-pixel line across the viewport (an
 * IntersectionObserver whose root margin leaves only that line), so scrolling
 * costs no scroll handler and no layout read: the browser reports each band
 * as it crosses the line. The line is measured again on resize, since the
 * element's place changes with the breakpoint; after the element's own
 * animations end, since the dock's entrance holds it below its place and a
 * line measured there sat on the admin bar; and on any mutation that moved
 * the element, since the admin bar appearing lifts the dock. The ground is
 * read again when the site theme flips, since an inverted band flips with it.
 *
 * `mounted` is for an element that renders after the hook's first run (a
 * portal waiting on the document): flip it once the element exists.
 */
export function useBandGround(
  ref: RefObject<HTMLElement | null>,
  mounted = true,
): Theme | undefined {
  const [ground, setGround] = useState<Theme | undefined>(undefined)
  const siteTheme = useSiteTheme()

  useEffect(() => {
    const element = ref.current
    if (!mounted || !element) return

    const crossing = new Set<Element>()
    let intersection: IntersectionObserver | null = null
    let current: Element[] = []
    let line = Number.NaN
    let disposed = false

    const settle = () => {
      const band = innermost(crossing)
      setGround(band ? readGround(band) : undefined)
    }

    const measure = () => {
      const rect = element.getBoundingClientRect()
      return Math.round(rect.top + rect.height / 2)
    }

    const observe = () => {
      intersection?.disconnect()
      crossing.clear()
      line = measure()
      const below = Math.max(window.innerHeight - line - 1, 0)
      intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) crossing.add(entry.target)
            else crossing.delete(entry.target)
          }
          settle()
        },
        { rootMargin: `-${line}px 0px -${below}px 0px` },
      )
      for (const band of current) intersection.observe(band)
      if (current.length === 0) settle()
      // Mid-entrance (or any transition of its own), the element is not where
      // it will rest: measure again once it is.
      const running = element.getAnimations().filter((a) => a.playState !== 'finished')
      if (running.length === 0) return
      Promise.all(running.map((a) => a.finished)).then(
        () => {
          if (!disposed && measure() !== line) observe()
        },
        () => {},
      )
    }

    const unsubscribe = subscribeBands((next) => {
      if (next === current && measure() === line) return
      current = next
      observe()
    })
    window.addEventListener('resize', observe)
    return () => {
      disposed = true
      unsubscribe()
      window.removeEventListener('resize', observe)
      intersection?.disconnect()
    }
  }, [ref, mounted, siteTheme])

  return ground
}

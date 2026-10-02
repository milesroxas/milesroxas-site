'use client'

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { onChromeScroll, pageFrameFrozen } from '@/components/SiteChrome/chrome-scroll'
import { type ContentsEntry, collectContentsEntries } from './headings'

/**
 * A section becomes current once its heading rises past this fraction of the
 * viewport: below the landing line of a jump (header height plus air), so the
 * row a reader picks is the row that lights up.
 */
const ACTIVATION_LINE = 0.35

type Tracking = {
  /** Index of the section being read, `-1` above the first heading. */
  current: number
  /** False over the hero (no heading has passed the fold) and the closing band. */
  visible: boolean
}

const AT_REST: Tracking = { current: -1, visible: false }

/** Cached edges, in document space, and the last scroll position. */
type Geometry = { tops: number[]; articleBottom: number; viewportHeight: number; scrollY: number }

type Position = Tracking & { progress: number }

/** Where the reader is, from cached geometry alone: no layout read. */
function positionAt({ tops, articleBottom, viewportHeight, scrollY }: Geometry): Position {
  const line = scrollY + viewportHeight * ACTIVATION_LINE
  const fold = scrollY + viewportHeight
  let current = -1
  while (current + 1 < tops.length && tops[current + 1] <= line) current++

  // Complete when the last section becomes current, or the article ends.
  const end = Math.min(tops[tops.length - 1] - (line - scrollY), articleBottom - viewportHeight)
  const progress = end > 0 ? Math.min(Math.max(scrollY / end, 0), 1) : 1
  return { current, progress, visible: tops[0] < fold && articleBottom > fold }
}

/**
 * Follows the article through scroll and resize, one pass per frame: edges
 * re-measured when stale, then the position handed to `onFrame`. Returns the
 * cleanup.
 */
function followArticle(
  article: HTMLElement,
  entries: ContentsEntry[],
  onFrame: (position: Position) => void,
) {
  const geometry: Geometry = { tops: [], articleBottom: 0, viewportHeight: 0, scrollY: 0 }
  let stale = true
  let frame = 0

  const measure = () => {
    if (pageFrameFrozen()) return
    const scrollY = window.scrollY
    geometry.scrollY = scrollY
    geometry.viewportHeight = window.innerHeight
    geometry.tops = entries.map((entry) => entry.element.getBoundingClientRect().top + scrollY)
    geometry.articleBottom = article.getBoundingClientRect().bottom + scrollY
    stale = false
  }

  // One pass per frame, every read before any write.
  const schedule = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (stale) measure()
      if (!stale) onFrame(positionAt(geometry))
    })
  }
  const invalidate = () => {
    stale = true
    schedule()
  }

  const unsubscribe = onChromeScroll((next) => {
    geometry.scrollY = next
    schedule()
  })
  const resizeObserver = new ResizeObserver(invalidate)
  resizeObserver.observe(article)
  window.addEventListener('resize', invalidate)
  invalidate()

  return () => {
    unsubscribe()
    resizeObserver.disconnect()
    window.removeEventListener('resize', invalidate)
    cancelAnimationFrame(frame)
  }
}

/**
 * Everything the Contents button derives from scroll, from cached geometry:
 * the section being read, whether the button shows, and the progress ring.
 * (Which surface it wears over a band is the chrome's shared
 * `useBandGround`.) `scopeRef` is any element inside the page's
 * `<article>`, the scope it indexes.
 *
 * Edges are measured once, in document space, and every scroll is
 * arithmetic against them with no layout read (docs/animations.md, "Nothing
 * forces layout in a scroll handler"). Scroll arrives through the chrome's
 * one subscription (`onChromeScroll`).
 *
 * React state changes only when a value flips. The progress ring moves every
 * frame, so it is written straight to the circle and never renders.
 */
export function useContentsTracking(
  scopeRef: RefObject<HTMLElement | null>,
  ringRef: RefObject<SVGCircleElement | null>,
) {
  const [entries, setEntries] = useState<ContentsEntry[]>([])
  const [tracking, setTracking] = useState(AT_REST)
  const trackingRef = useRef(AT_REST)

  // Layout effect, so the ids exist before the route's hash scroll
  // (`LenisRouteReset`, an ancestor's layout effect) looks one up.
  useLayoutEffect(() => {
    const article = scopeRef.current?.closest('article')
    if (!article) return
    const collected = collectContentsEntries(article)
    setEntries(collected.entries)
    return collected.restore
  }, [scopeRef])

  useEffect(() => {
    const article = scopeRef.current?.closest('article')
    if (!article || entries.length === 0) return

    return followArticle(article, entries, ({ current, progress, visible }) => {
      ringRef.current?.style.setProperty('stroke-dashoffset', String(1 - progress))

      const next: Tracking = { current, visible }
      const last = trackingRef.current
      if (next.current === last.current && next.visible === last.visible) return
      trackingRef.current = next
      setTracking(next)
    })
  }, [scopeRef, ringRef, entries])

  return { entries, ...tracking }
}

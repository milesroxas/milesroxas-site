'use client'

import gsap from 'gsap'
import { type LenisRef, ReactLenis, useLenis } from 'lenis/react'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useSitePathname } from '@/hooks/use-site-pathname'
import 'lenis/dist/lenis.css'

/**
 * A frame longer than this is a stall, not scrolling: the ticker then
 * advances every clock by `LAG_ADJUST_MS` instead of the real gap, so Lenis
 * eases on from where it was rather than leaping to catch up.
 */
const LAG_THRESHOLD_MS = 100
const LAG_ADJUST_MS = 33

/**
 * The most Lenis's clock advances in one frame (ms): two 60Hz frames. Its
 * lerp is time-based, so a 75ms frame (a paragraph split into lines, an image
 * decode) moved the page by the whole gap at once, four times the frame
 * before it. GSAP's lag smoothing only catches gaps past `LAG_THRESHOLD_MS`;
 * this catches the common, shorter stall, and a scroll eases on from where it
 * was.
 */
const MAX_STEP_MS = 34

type LenisProviderProps = {
  children: React.ReactNode
}

/**
 * Every route change lands at the top of the new page, or at its anchor.
 *
 * Lenis lives in this persistent provider, so it survives a navigation and
 * keeps the old page's `targetScroll`. Next scrolls the document to the top
 * once the new route commits, but Lenis ignores native scrolls while its own
 * ease is still running and stamps the stale position back on its next
 * frame: a page opened mid-scroll lands part way down (or at its bottom,
 * where the browser clamped the old offset). And Next only scrolls when the
 * route's first element is a laid-out box: the works dial's desktop wrapper
 * is `display: contents` beside a hidden phone list, so Next never scrolls
 * there at all. This resets Lenis itself, which also stops its ease.
 *
 * Back and Forward land at the top too (browser restoration is `manual`
 * while mounted, so it cannot fight the reset on popstate), as on sas-site.
 *
 * A layout effect, not a passive one: React commits the new route inside
 * `document.startViewTransition`'s update callback and the browser snapshots
 * the incoming page as soon as that callback resolves. A passive effect runs
 * after the snapshot, so the work morph would be captured at a stale offset
 * and the page yanked to the top mid-animation.
 */
const LenisRouteReset: React.FC = () => {
  const pathname = useSitePathname()
  const lenis = useLenis()
  const lastPathname = useRef(pathname)

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    // An actual route change only: not the first mount, not Lenis arriving.
    if (pathname === lastPathname.current) return
    lastPathname.current = pathname

    const anchor = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null
    if (lenis) lenis.scrollTo(anchor ?? 0, { immediate: true, force: true })
    else if (anchor) anchor.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, lenis])

  return null
}

/**
 * Smooth scrolling for the whole document, stepped from GSAP's ticker so the
 * scroll position and every tween advance in one frame loop with one clock.
 * Lenis's own loop would catch up after a long frame by jumping: its lerp is
 * time-based, and a 150ms stall moved the page a quarter screen in one frame.
 * Lenis's stylesheet keeps nested scrollers (`data-lenis-prevent`) from
 * chaining into the page and iframes from swallowing the wheel mid-scroll.
 */
export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const ref = useRef<LenisRef>(null)

  useEffect(() => {
    let clock = 0
    const step = (_time: number, deltaTime: number) => {
      clock += Math.min(deltaTime, MAX_STEP_MS)
      ref.current?.lenis?.raf(clock)
    }
    gsap.ticker.add(step)
    gsap.ticker.lagSmoothing(LAG_THRESHOLD_MS, LAG_ADJUST_MS)
    return () => {
      gsap.ticker.remove(step)
    }
  }, [])

  return (
    <ReactLenis options={{ autoRaf: false }} ref={ref} root>
      <LenisRouteReset />
      {children}
    </ReactLenis>
  )
}

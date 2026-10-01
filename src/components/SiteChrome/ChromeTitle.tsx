'use client'

import { useEffect, useRef } from 'react'
import { useChromeStore } from '@/stores/chromeStore'

/** The top bar (TopBar.tsx), whose bottom edge is the line the page's heading scrolls under. */
const CHROME_TOP_SELECTOR = '[data-chrome-top]'

/**
 * Hands the page's title to the top bar, which shows it beside the current
 * tab ("Work › Title") once the page's own heading has scrolled under the
 * bar. Place it directly after that heading: it renders an empty marker and
 * watches it cross the bar's bottom edge. Leaving the page takes the title
 * with it.
 */
export function ChromeTitle({ title }: { title: string }) {
  const markerRef = useRef<HTMLDivElement>(null)
  const setTitle = useChromeStore((state) => state.setTitle)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    setTitle({ text: title, shown: false })

    let observer: IntersectionObserver | null = null
    const observe = () => {
      observer?.disconnect()
      const bar = document.querySelector<HTMLElement>(CHROME_TOP_SELECTOR)
      observer = new IntersectionObserver(
        ([entry]) => {
          const above = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0)
          setTitle({ text: title, shown: !entry.isIntersecting && above })
        },
        { rootMargin: `-${bar?.offsetHeight ?? 0}px 0px 0px 0px` },
      )
      observer.observe(marker)
    }
    observe()
    window.addEventListener('resize', observe)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', observe)
      setTitle(null)
    }
  }, [title, setTitle])

  return <div aria-hidden className="h-0" ref={markerRef} />
}

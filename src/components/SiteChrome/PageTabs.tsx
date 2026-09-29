'use client'

import Link from 'next/link'
import { type MouseEvent, useLayoutEffect, useRef } from 'react'
import { cn } from '@/utilities/ui'
import { glyphForPath } from './glyphs'
import type { ChromeTab } from './tabs'

/** A click the browser handles itself (new tab, new window, download): the page does not change here. */
const opensElsewhere = (event: MouseEvent, tab: ChromeTab) =>
  tab.newTab ||
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey

type PageTabsProps = {
  tabs: ChromeTab[]
  /** Index of the current page's tab, or -1 when no tab owns the page. */
  active: number
  /** A tab was pressed and this page is about to change to it. */
  onSelect: (index: number) => void
  /** Collapsed into the current tab (phones, scrolling down): out of the tab order. */
  minimized: boolean
  className?: string
}

/**
 * The site's pages as a tab group, always visible, the current one filled.
 * Text tabs in a capsule from `md`; icon-over-label tabs across a bar on a
 * phone. They are links in a labelled nav, not ARIA tabs: each one opens a
 * page, and the current one says so with `aria-current`.
 *
 * The fill is one layer under the labels, clipped to the current tab. A new
 * page moves the clip, so the fill slides across on the site's spring
 * (`--ease-spring`, damping 1, response 0.35s) instead of one tab fading out
 * while another fades in. The clip is placed from layout offsets, which
 * ignore the press scale and the dock's own transforms, and only when the
 * current tab or the bar's width changes.
 */
export function PageTabs({ tabs, active, onSelect, minimized, className }: PageTabsProps) {
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([])

  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    if (!indicator) return
    const place = () => {
      const tab = tabRefs.current[active]
      if (!tab) {
        indicator.removeAttribute('data-placed')
        return
      }
      const left = tab.offsetLeft - indicator.offsetLeft
      const right = indicator.offsetWidth - left - tab.offsetWidth
      indicator.style.setProperty('--tab-left', `${left}px`)
      indicator.style.setProperty('--tab-right', `${right}px`)
      // The first placement lands where it belongs; only later moves slide.
      if (!indicator.hasAttribute('data-placed')) {
        indicator.setAttribute('data-placed', '')
        requestAnimationFrame(() => indicator.setAttribute('data-ready', ''))
      }
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(indicator)
    return () => observer.disconnect()
  }, [active])

  return (
    <nav
      aria-label="Site"
      className={cn('dock-tabs chrome-material relative rounded-full', className)}
      data-minimized={minimized || undefined}
      inert={minimized || undefined}
    >
      <span aria-hidden className="dock-indicator" ref={indicatorRef} />
      <ul className="flex h-full md:gap-0.5">
        {tabs.map((tab, index) => {
          const Glyph = glyphForPath(tab.href)
          return (
            <li className="flex max-md:flex-1" key={tab.href}>
              <Link
                aria-current={index === active ? 'page' : undefined}
                className="dock-tab chrome-focus pressable"
                href={tab.href}
                onClick={(event) => {
                  if (!opensElsewhere(event, tab)) onSelect(index)
                }}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                {...(tab.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
              >
                <Glyph className="size-5.5 md:hidden" />
                <span className="dock-label" data-label={tab.label}>
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

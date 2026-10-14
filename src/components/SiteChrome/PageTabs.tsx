'use client'

import Link from 'next/link'
import { type RefObject, useLayoutEffect, useRef } from 'react'
import { usePresence } from '@/hooks/use-presence'
import { cn } from '@/utilities/ui'
import { CloseGlyph, glyphForPath } from './glyphs'
import type { ChromeTab, TabCurrent } from './tabs'

/** Clips the fill to `tab`, or lifts it when no tab owns the page. */
function placeIndicator(indicator: HTMLSpanElement, tab: HTMLAnchorElement | null | undefined) {
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

/** How long the close button's exit runs (globals.css `.dock-close`), plus a frame. */
const CLOSE_EXIT_MS = 220

/**
 * Keeps the fill on its tab while the close button comes or goes: the tabs
 * reflow around it, and the fill is placed frame by frame with its slide
 * off, so it rides the tab instead of chasing it. Arriving is one frame (the
 * tabs are invisible then); leaving is followed for the length of the exit.
 */
function useFollowClose(
  indicatorRef: RefObject<HTMLSpanElement | null>,
  tabRefs: RefObject<Array<HTMLAnchorElement | null>>,
  active: number,
  closeShown: boolean,
) {
  const seen = useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies(active): the current tab is read, not watched
  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    // Nothing to follow on the first render: the fill is placed by its own effect.
    if (!indicator || !seen.current) {
      seen.current = true
      return
    }
    const place = () => placeIndicator(indicator, tabRefs.current[active])
    indicator.setAttribute('data-following', '')
    place()
    let frame = 0
    if (!closeShown) {
      const tick = () => {
        place()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    const stop = window.setTimeout(
      () => {
        cancelAnimationFrame(frame)
        place()
        indicator.removeAttribute('data-following')
      },
      closeShown ? 0 : CLOSE_EXIT_MS,
    )
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(stop)
      indicator.removeAttribute('data-following')
    }
  }, [indicatorRef, tabRefs, closeShown])
}

type PageTabsProps = {
  tabs: ChromeTab[]
  /** Index of the current page's tab, or -1 when no tab owns the page. */
  active: number
  /** The active tab's own page, or a page under it. */
  current: TabCurrent
  /** A tab was pressed and this page is about to change to it (client-side only). */
  onSelect: (index: number) => void
  /** Folded into the Menu pill (phones, scrolling down): out of the tab order. */
  minimized: boolean
  /** Opened from the Menu pill: a close button stands where the pill was. */
  onClose?: (() => void) | null
  closeRef?: RefObject<HTMLButtonElement | null>
  className?: string
}

/**
 * The site's pages as a tab group, always visible, the current one filled.
 * On a page under a tab (a case study under Work) the tab is outlined, not
 * filled: the visitor is inside its section, and it still links back to the
 * index, with the hover and press every other link has. The fill hollows into
 * the outline as the page goes a level down, and fills back on the way up.
 * Text tabs from `md`; icon-over-label tabs across the bar on a phone. The
 * glass under them is the dock's plate (`Dock`), not the nav's own. They are links in a labelled nav, not ARIA tabs: each one opens a
 * page, and the current one says so with `aria-current`: `page` on its own
 * page, `true` on a page under it.
 *
 * The fill is one layer under the labels, clipped to the current tab. A new
 * page moves the clip, so the fill slides across on the site's spring
 * (`--ease-spring`, damping 1, response 0.35s) instead of one tab fading out
 * while another fades in. The clip is placed from layout offsets, which
 * ignore the press scale and the dock's own transforms, and only when the
 * current tab or the bar's width changes.
 */
export function PageTabs({
  tabs,
  active,
  current,
  onSelect,
  minimized,
  onClose,
  closeRef,
  className,
}: PageTabsProps) {
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const closeOwnRef = useRef<HTMLButtonElement>(null)
  const closeShown = Boolean(onClose)
  // Stays mounted through its exit transition (globals.css `.dock-close`).
  const { mounted: closeMounted } = usePresence(closeOwnRef, closeShown)
  const closeHandler = useRef(onClose)
  if (onClose) closeHandler.current = onClose

  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    if (!indicator) return
    const place = () => placeIndicator(indicator, tabRefs.current[active])
    place()
    const observer = new ResizeObserver(place)
    observer.observe(indicator)
    return () => observer.disconnect()
  }, [active])
  useFollowClose(indicatorRef, tabRefs, active, closeShown)

  return (
    <nav
      aria-label="Site"
      className={cn('dock-tabs', className)}
      data-minimized={minimized || undefined}
      inert={minimized || undefined}
    >
      <span aria-hidden className="dock-indicator" data-current={current} ref={indicatorRef} />
      {closeMounted && (
        <button
          aria-hidden={!closeShown || undefined}
          aria-label="Hide pages"
          className="dock-close chrome-focus pressable md:hidden"
          data-open={closeShown || undefined}
          onClick={() => closeHandler.current?.()}
          ref={(element) => {
            closeOwnRef.current = element
            if (closeRef) closeRef.current = element
          }}
          tabIndex={closeShown ? 0 : -1}
          type="button"
        >
          <CloseGlyph className="size-[1.125rem]" />
        </button>
      )}
      <ul className="flex h-full min-w-0 flex-1 md:gap-0.5">
        {tabs.map((tab, index) => {
          const Glyph = glyphForPath(tab.href)
          return (
            <li className="flex max-md:flex-1" key={tab.href}>
              <Link
                aria-current={index === active ? (current === 'page' ? 'page' : 'true') : undefined}
                className="dock-tab chrome-focus pressable"
                href={tab.href}
                onNavigate={() => onSelect(index)}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                {...(tab.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
              >
                <Glyph className="size-5 md:hidden" />
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

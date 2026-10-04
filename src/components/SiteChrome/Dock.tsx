'use client'

import { usePathname } from 'next/navigation'
import { type RefObject, useEffect, useRef, useState } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { onChromeScroll } from './chrome-scroll'
import { AskGlyph, glyphForPath } from './glyphs'
import { PageTabs } from './PageTabs'
import type { ChromeTab, TabCurrent } from './tabs'
import { useBandGround } from './use-band-ground'

/** Phone tab bar: collapse after this much downward travel, restore after this much upward. */
const MINIMIZE_AFTER_PX = 48
const RESTORE_AFTER_PX = 24

/** Held back before the Ask tooltip shows, so a pass over the dock never flashes it. */
const TOOLTIP_DELAY_MS = 600

/**
 * Phones only: scrolling down collapses the tab bar into its current tab so
 * more of the page shows; scrolling up, reaching the top, a new page, or a
 * tap on the collapsed tab brings the bar back. Travel counts per direction,
 * so a reader nudging the page back and forth never flips it.
 */
function useMinimizedTabs(enabled: boolean) {
  const [minimized, setMinimized] = useState(false)
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies(pathname): a new page restores the bar
  useEffect(() => {
    setMinimized(false)
    if (!enabled) return
    let last = window.scrollY
    let travel = 0
    return onChromeScroll((scrollY) => {
      const delta = scrollY - last
      last = scrollY
      if (delta === 0) return
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta
      if (scrollY <= MINIMIZE_AFTER_PX || travel < -RESTORE_AFTER_PX) setMinimized(false)
      else if (travel > MINIMIZE_AFTER_PX) setMinimized(true)
    })
  }, [enabled, pathname])

  return [minimized, () => setMinimized(false)] as const
}

/** The shortcut as this platform writes it. Read only once a tooltip renders, so never on the server. */
const shortcutKeys = () =>
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'

type DockAsk = {
  triggerRef: RefObject<HTMLButtonElement | null>
  /** The panel is open or still playing its exit: the button's place is taken by the field. */
  present: boolean
  open: boolean
  onOpen: () => void
}

type DockProps = {
  tabs: ChromeTab[]
  active: number
  current: TabCurrent
  onSelect: (index: number) => void
  /** Null when Site Info › Ask › Hide Ask is on. */
  ask: DockAsk | null
}

/** The current tab alone, shown while the bar is minimized; a tap brings the bar back. */
function DockMini({
  tab,
  minimized,
  onRestore,
}: {
  tab: ChromeTab
  minimized: boolean
  onRestore: () => void
}) {
  const Glyph = glyphForPath(tab.href)
  return (
    <button
      aria-hidden={!minimized}
      aria-label={`${tab.label}. Show all pages`}
      className="dock-mini chrome-material chrome-focus"
      data-shown={minimized || undefined}
      onClick={onRestore}
      tabIndex={minimized ? 0 : -1}
      type="button"
    >
      <span className="dock-mini-fill">
        <Glyph className="size-5" />
        {tab.label}
      </span>
    </button>
  )
}

function DockAskButton({ ask }: { ask: DockAsk }) {
  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-expanded={ask.open}
            aria-haspopup="dialog"
            aria-keyshortcuts="Meta+K Control+K"
            className="dock-ask chrome-material chrome-focus"
            data-present={ask.present || undefined}
            onClick={ask.onOpen}
            // Focus handed back after a pointer close is not a request
            // for the tooltip; keyboard focus still shows the shortcut.
            onFocus={(event) => {
              if (!event.currentTarget.matches(':focus-visible')) event.preventDefault()
            }}
            ref={ask.triggerRef}
            type="button"
          >
            <AskGlyph className="size-6 text-(--chrome-glyph) md:size-4" />
            <span className="max-md:sr-only">Ask</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-md:hidden" side="top" sideOffset={8}>
          Ask
          <Kbd>{shortcutKeys()}</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * The bottom of the chrome: the pages, and Ask beside them as its own
 * action. The two never share a control, so a visitor always knows which one
 * navigates and which one starts a conversation.
 *
 * The dock samples the band under it and wears that band's ground: its dark
 * material over a dark one, its light glass over a light one. While Ask is open the tabs step back (fade, 0.96, blur) and the
 * Ask field takes the button's place.
 */
export function Dock({ tabs, active, current, onSelect, ask }: DockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const ground = useBandGround(ref)
  const phone = useIsMobile()
  const [minimized, restore] = useMinimizedTabs(phone && active >= 0)
  const currentTab = tabs[active]

  return (
    <div
      className="dock"
      data-chrome=""
      data-ask={ask?.open ? 'open' : ask?.present ? 'closing' : undefined}
      data-theme={ground}
      ref={ref}
    >
      <div className="dock-tabs-slot">
        <PageTabs
          active={active}
          current={current}
          minimized={minimized}
          onSelect={onSelect}
          tabs={tabs}
        />
        {currentTab && <DockMini minimized={minimized} onRestore={restore} tab={currentTab} />}
      </div>

      {ask && <DockAskButton ask={ask} />}
    </div>
  )
}

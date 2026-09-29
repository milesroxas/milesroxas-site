'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AskPanel } from '@/features/ask/AskPanel'
import type { AskHandoffTerms } from '@/features/ask/handoff'
import { useIsMobile } from '@/hooks/use-mobile'
import { useChromeStore } from '@/stores/chromeStore'
import { useScrolledChrome } from './chrome-scroll'
import { Dock } from './Dock'
import { TopBar } from './TopBar'
import { activeTabIndex, type ChromeTab } from './tabs'

/** A page that never hands the chrome back (an interrupted transition) gets it back after this. */
const RESTORE_FALLBACK_MS = 2000

export type SiteChromeAsk = {
  suggestions: string[]
  terms: AskHandoffTerms
}

type SiteChromeClientProps = {
  tabs: ChromeTab[]
  /** Null when Site Info › Ask › Hide Ask is on. */
  ask: SiteChromeAsk | null
}

/** ⌘K on a Mac, Ctrl+K elsewhere; never while a modifier chord means something else. */
const isAskShortcut = (event: KeyboardEvent) =>
  event.key.toLowerCase() === 'k' &&
  (event.metaKey || event.ctrlKey) &&
  !event.altKey &&
  !event.shiftKey

/**
 * The site's chrome, on every public page: the top bar (wordmark, the
 * page's place, the clock) and the dock (the pages and Ask), each with the
 * scroll edge that keeps it legible over whatever passes beneath.
 *
 * The current tab follows the route, and follows a press at once: the fill
 * moves on the tap, not once the next page has loaded. During the card →
 * case study transition the chrome steps out of the way (`useChromeStore`).
 */
export function SiteChromeClient({ tabs, ask }: SiteChromeClientProps) {
  useScrolledChrome()
  const pathname = usePathname()
  const phone = useIsMobile()
  const visible = useChromeStore((state) => state.visible)
  const setVisible = useChromeStore((state) => state.setVisible)

  const [pressed, setPressed] = useState<{ on: string; index: number } | null>(null)
  const active = pressed && pressed.on === pathname ? pressed.index : activeTabIndex(tabs, pathname)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [askOpen, setAskOpen] = useState(false)
  const [askPresent, setAskPresent] = useState(false)
  // Whether the last open or close came from the keyboard: that one plays no morph.
  const [viaKeyboard, setViaKeyboard] = useState(false)
  const toggleAsk = useCallback((open: boolean, keyboard: boolean) => {
    setViaKeyboard(keyboard)
    setAskOpen(open)
  }, [])
  const changeAskFromPanel = useCallback((open: boolean) => toggleAsk(open, false), [toggleAsk])

  const askOpenRef = useRef(askOpen)
  useEffect(() => {
    askOpenRef.current = askOpen
  }, [askOpen])

  useEffect(() => {
    if (!ask) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isAskShortcut(event) || event.defaultPrevented) return
      event.preventDefault()
      toggleAsk(!askOpenRef.current, true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ask, toggleAsk])

  // A transition that never reached its hero still hands the chrome back.
  // biome-ignore lint/correctness/useExhaustiveDependencies(pathname): each new page restarts the fallback
  useEffect(() => {
    if (visible) return
    const timer = window.setTimeout(() => setVisible(true), RESTORE_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [visible, setVisible, pathname])

  return (
    <div className="contents" data-hidden={visible ? undefined : ''} id="site-chrome">
      <TopBar section={active >= 0 ? tabs[active].label : null} />
      <Dock
        active={active}
        ask={
          ask && {
            triggerRef,
            open: askOpen,
            present: askPresent,
            onOpen: () => toggleAsk(true, false),
          }
        }
        onSelect={(index) => setPressed({ on: pathname, index })}
        tabs={tabs}
      />
      {ask && (
        <AskPanel
          instant={viaKeyboard}
          onOpenChange={changeAskFromPanel}
          onPresenceChange={setAskPresent}
          open={askOpen}
          sheet={phone}
          suggestions={ask.suggestions}
          terms={ask.terms}
          triggerRef={triggerRef}
        />
      )}
    </div>
  )
}

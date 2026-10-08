'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AskPanel } from '@/features/ask/AskPanel'
import type { AskHandoffTerms } from '@/features/ask/handoff'
import { useIsMobile } from '@/hooks/use-mobile'
import { Dock } from './Dock'
import { TopBar } from './TopBar'
import { activeTabIndex, type ChromeTab, tabCurrent } from './tabs'

type SiteChromeAsk = {
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
 * Ask's open state. `viaKeyboard` is whether the last open or close came from
 * the keyboard: that one plays no morph. While Ask is on, the shortcut toggles it.
 */
function useAskToggle(ask: SiteChromeAsk | null) {
  const [askOpen, setAskOpen] = useState(false)
  const [askPresent, setAskPresent] = useState(false)
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

  return { askOpen, askPresent, setAskPresent, viaKeyboard, toggleAsk, changeAskFromPanel }
}

/**
 * The site's chrome, on every public page: the top bar (wordmark, the
 * page's place, the clock) and the dock (the pages and Ask).
 *
 * The current tab follows the route, and follows a press at once: the fill
 * moves on the tap, not once the next page has loaded.
 */
export function SiteChromeClient({ tabs, ask }: SiteChromeClientProps) {
  const pathname = usePathname()
  const phone = useIsMobile()

  const [pressed, setPressed] = useState<{ on: string; index: number } | null>(null)
  const press = pressed && pressed.on === pathname ? pressed.index : null
  const active = press ?? activeTabIndex(tabs, pathname)
  // A press heads for the tab's own page, so it fills at once.
  const current = press !== null || active < 0 ? 'page' : tabCurrent(tabs[active], pathname)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const { askOpen, askPresent, setAskPresent, viaKeyboard, toggleAsk, changeAskFromPanel } =
    useAskToggle(ask)

  return (
    <div className="contents" id="site-chrome">
      <TopBar section={active >= 0 ? tabs[active].label : null} />
      <Dock
        active={active}
        current={current}
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

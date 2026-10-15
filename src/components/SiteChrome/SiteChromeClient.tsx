'use client'

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useAskReady } from '@/features/ask/AskSession'
import type { AskHandoffTerms } from '@/features/ask/handoff'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSitePathname } from '@/hooks/use-site-pathname'
import { whenIdle } from '@/utilities/whenIdle'
import { Dock } from './Dock'
import { TopBar } from './TopBar'
import { activeTabIndex, type ChromeTab, tabCurrent } from './tabs'

/**
 * The panel in its own chunk, fetched once the page is idle (with the chat
 * runtime the session provider fetches then) and mounted once the session
 * exists. A press before that opens it the moment it lands.
 */
const loadAskPanel = () => import('@/features/ask/AskPanel')
const AskPanel = lazy(() => loadAskPanel().then((module) => ({ default: module.AskPanel })))

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
 * The tab pressed on this page, until the route moves: the next page
 * (pressed or not), or Back and Forward, which may land here again with the
 * press long over, hand the choice back to the route.
 */
function usePress(pathname: string) {
  const [pressed, setPressed] = useState<{ on: string; index: number } | null>(null)
  if (pressed && pressed.on !== pathname) setPressed(null)
  useEffect(() => {
    const clear = () => setPressed(null)
    window.addEventListener('popstate', clear)
    return () => window.removeEventListener('popstate', clear)
  }, [])
  const set = useCallback((index: number) => setPressed({ on: pathname, index }), [pathname])
  return { index: pressed?.index ?? null, set }
}

/**
 * The site's chrome, on every public page: the top bar (wordmark, the
 * page's place, the clock) and the dock (the pages and Ask).
 *
 * The current tab follows the route, and follows a press at once: the fill
 * moves on the tap, not once the next page has loaded.
 */
export function SiteChromeClient({ tabs, ask }: SiteChromeClientProps) {
  const pathname = useSitePathname()
  const phone = useIsMobile()

  const press = usePress(pathname)
  const active = press.index ?? activeTabIndex(tabs, pathname)
  // A press heads for the tab's own page, so it fills at once.
  const current = press.index !== null || active < 0 ? 'page' : tabCurrent(tabs[active], pathname)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const { askOpen, askPresent, setAskPresent, viaKeyboard, toggleAsk, changeAskFromPanel } =
    useAskToggle(ask)
  const askReady = useAskReady()
  useEffect(() => {
    if (!ask) return
    return whenIdle(() => {
      void loadAskPanel()
    })
  }, [ask])

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
        onSelect={press.set}
        tabs={tabs}
      />
      {ask && askReady && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </div>
  )
}

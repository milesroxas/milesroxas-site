'use client'

import { IconList, IconX } from '@tabler/icons-react'
import { useLenis } from 'lenis/react'
import {
  type ComponentType,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { onChromeScroll } from '@/components/SiteChrome/chrome-scroll'
import { useBandGround } from '@/components/SiteChrome/use-band-ground'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePresence } from '@/hooks/use-presence'
import { focusForKeyboard, trackInputModality } from '@/utilities/input-modality'
import { cn } from '@/utilities/ui'
import { whenIdle } from '@/utilities/whenIdle'
import type { ContentsPanelProps } from './ContentsPanel'
import { CONTENTS_MIN_ENTRIES, type ContentsEntry } from './headings'
import { useContentsTracking } from './use-contents-tracking'

type Panel = ComponentType<ContentsPanelProps>

/**
 * The index (list, scroll area, sheet, drag) is fetched once the button is on
 * screen and the main thread is idle, never with the page: a reader who does
 * not open it pays for the button alone (docs/performance-audit-work-pages.md,
 * M3). Held in state rather than `lazy` + Suspense: a suspended open commits
 * the fallback first, and React then holds the real content back for its
 * fallback throttle (~300ms), which lands on the one press that matters.
 */
function useContentsPanel() {
  const [Panel, setPanel] = useState<Panel | null>(null)
  const warm = useCallback(() => {
    import('./ContentsPanel').then((module) => setPanel(() => module.default))
  }, [])
  return [Panel, warm] as const
}

/** Arrival: the labeled pill collapses after this long, or this much scroll. */
const ARRIVAL_HOLD_MS = 2500
const ARRIVAL_SCROLL_PX = 200
/** Once per visit, so the label teaches the icon and then stays out of the way. */
const ARRIVAL_SEEN_KEY = 'contents-arrival-seen'

const LABEL = 'Contents'

/**
 * The button's surface, two states of one circle. At rest it is the system
 * popover surface, as every floating menu on the site; open, it shrinks into
 * the card's close slot and hands its shadow to the card.
 */
const SURFACE = {
  rest: cn(
    'bg-popover shadow-[0_8px_24px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-foreground/10',
    // The arrival pill sits over the circle and carries the lift for both.
    'group-hover/trigger:bg-muted group-data-[arrival=extended]:shadow-none',
  ),
  open: 'scale-70 bg-accent',
}

/**
 * Whether this is the visit's first showing. Storage can be unavailable
 * (private mode, blocked cookies): then the label simply shows again.
 */
const claimArrival = () => {
  try {
    if (sessionStorage.getItem(ARRIVAL_SEEN_KEY)) return false
    sessionStorage.setItem(ARRIVAL_SEEN_KEY, '1')
  } catch {}
  return true
}

/**
 * First showing of a visit: the button arrives as a labeled pill, then sweeps
 * back into its circle. Rendered inside the button, so the whole pill presses.
 */
function Arrival({ extended }: { extended: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { mounted, animating } = usePresence(ref, extended)
  if (!mounted) return null
  return (
    // The parent carries the edge: a clip cuts off the pill's own shadow.
    <span aria-hidden className="contents-shape-shadow absolute inset-y-0 right-0" data-lift>
      <span
        className="contents-arrival flex h-full items-center gap-2.5 bg-popover pr-6 pl-5 text-sm/5 font-medium whitespace-nowrap text-popover-foreground"
        data-animating={animating || undefined}
        data-open={extended}
        ref={ref}
      >
        <IconList className="size-5" />
        <span>{LABEL}</span>
      </span>
    </span>
  )
}

type ArrivalState = 'pending' | 'extended' | 'done'

/**
 * The arrival pill's lifecycle: claimed on the first showing of a visit (the
 * index warms then too), collapsed after a hold or a little scroll.
 */
function useArrival(shown: boolean, warmPanel: () => void) {
  const [arrival, setArrival] = useState<ArrivalState>('pending')

  useEffect(() => {
    if (!shown) return
    const cancelWarm = whenIdle(warmPanel)
    if (arrival !== 'pending') return cancelWarm
    setArrival(claimArrival() ? 'extended' : 'done')
    return cancelWarm
  }, [shown, arrival, warmPanel])

  useEffect(() => {
    if (arrival !== 'extended') return
    const collapse = () => setArrival('done')
    const timer = window.setTimeout(collapse, ARRIVAL_HOLD_MS)
    let from: number | null = null
    const unsubscribe = onChromeScroll((scrollY) => {
      from ??= scrollY
      if (Math.abs(scrollY - from) > ARRIVAL_SCROLL_PX) collapse()
    })
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [arrival])

  return [arrival, setArrival] as const
}

/**
 * Scroll to a section (or the top, for null) and land keyboard focus on it.
 * Lenis is the only writer of the scroll position. Without it (reduced motion
 * turns the provider off) the jump lands instantly, natively.
 */
function scrollToEntry(lenis: ReturnType<typeof useLenis>, entry: ContentsEntry | null) {
  const target = entry?.element ?? null
  const land = () => focusForKeyboard(target, { preventScroll: true })
  window.history.replaceState(
    window.history.state,
    '',
    entry ? `#${entry.id}` : window.location.pathname + window.location.search,
  )
  if (lenis) lenis.scrollTo(target ?? 0, { onComplete: land })
  else {
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
    land()
  }
}

/** The body, once mounted: the button portals beside the site chrome, never server-side. */
function usePortalHost() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  useEffect(() => setHost(document.body), [])
  return host
}

/** Whether the index is open, and the ways it closes: dismissed, jumped from, or left behind. */
function useContentsOpen(shown: boolean, triggerRef: RefObject<HTMLButtonElement | null>) {
  const lenis = useLenis()
  const [open, setOpen] = useState(false)

  // Leaving the article (hero above, closing band below) puts the index away.
  if (!shown && open) setOpen(false)

  const close = useCallback<ContentsPanelProps['onClose']>(
    (options) => {
      setOpen(false)
      if (options?.restoreFocus) focusForKeyboard(triggerRef.current, { preventScroll: true })
    },
    [triggerRef],
  )

  const jump = useCallback(
    (entry: ContentsEntry | null) => {
      setOpen(false)
      scrollToEntry(lenis, entry)
    },
    [lenis],
  )

  return { close, jump, open, setOpen }
}

/** The trigger's accessible name: the index, and where the reader is in it. */
const triggerLabel = (section: ContentsEntry | undefined, current: number, total: number) =>
  section ? `${LABEL}, section ${current + 1} of ${total}, ${section.label}` : LABEL

/** Everything the button tracks and decides; the component only renders it. */
function useContentsButton() {
  const scopeRef = useRef<HTMLSpanElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const panelId = useId()
  const sheet = useIsMobile()

  const { entries, current, visible } = useContentsTracking(scopeRef, ringRef)
  const host = usePortalHost()
  const ground = useBandGround(anchorRef, host !== null)

  const enabled = entries.length >= CONTENTS_MIN_ENTRIES
  const shown = enabled && visible

  const { close, jump, open, setOpen } = useContentsOpen(shown, triggerRef)
  const [Panel, warmPanel] = useContentsPanel()

  useEffect(() => trackInputModality(), [])

  const [arrival, setArrival] = useArrival(shown, warmPanel)

  const toggle = () => {
    setArrival('done')
    warmPanel()
    setOpen((value) => !value)
  }

  return {
    refs: { anchorRef, ringRef, scopeRef, triggerRef },
    close,
    current,
    enabled,
    entries,
    extended: arrival === 'extended' && !open,
    ground,
    host,
    jump,
    open,
    Panel,
    panelId,
    sheet,
    shown,
    toggle,
    warmPanel,
  }
}

/**
 * The Contents button: a floating index of the page's section headings, for
 * the collections that opt in (`showContents`). Render it inside the page's
 * `<article>`; that is the scope it indexes. The button itself is portaled to
 * the body, beside the site chrome, so it floats above the chrome's scroll
 * edges rather than inside the article's stacking context under them.
 *
 * One button is both the trigger and the close control. It never moves: the
 * card grows out from under it and the button becomes the card's close slot,
 * so opening and closing are two presses on the same spot.
 */
export function ContentsButton() {
  const { refs, current, entries, extended, open, Panel, panelId, ...state } = useContentsButton()
  const section = entries[current]

  const anchor = (
    <div
      className="contents-anchor group"
      data-arrival={extended ? 'extended' : undefined}
      data-chrome=""
      data-open={open}
      // The band under the button decides its surface, as it does the bars'.
      data-theme={state.ground}
      data-visible={state.shown}
      ref={refs.anchorRef}
    >
      {state.enabled && (
        <>
          <Trigger
            extended={extended}
            label={triggerLabel(section, current, entries.length)}
            onToggle={state.toggle}
            onWarm={state.warmPanel}
            open={open}
            panelId={panelId}
            ringRef={refs.ringRef}
            triggerRef={refs.triggerRef}
          />
          {/* The one place the section's name lives outside the index. */}
          {section && !open && <SectionHint label={section.label} number={current + 1} />}
          {/* Mounted once fetched, open or not, so the card can play its exit. */}
          {Panel && (
            <Panel
              anchorRef={refs.anchorRef}
              current={current}
              entries={entries}
              id={panelId}
              onClose={state.close}
              onJump={state.jump}
              open={open}
              sheet={state.sheet}
            />
          )}
        </>
      )}
    </div>
  )

  return (
    <>
      <span hidden ref={refs.scopeRef} />
      {state.host && createPortal(anchor, state.host)}
    </>
  )
}

/** The one press target: it opens the index and, once open, is the card's close control. */
function Trigger({
  extended,
  label,
  onToggle,
  onWarm,
  open,
  panelId,
  ringRef,
  triggerRef,
}: {
  extended: boolean
  label: string
  onToggle: () => void
  onWarm: () => void
  open: boolean
  panelId: string
  ringRef: RefObject<SVGCircleElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      aria-controls={panelId}
      aria-expanded={open}
      aria-label={label}
      className="group/trigger pressable peer relative z-10 flex size-14 cursor-pointer items-center justify-center rounded-full text-popover-foreground outline-hidden"
      onClick={onToggle}
      // Warm the index the moment a press is likely.
      onFocus={onWarm}
      onPointerEnter={onWarm}
      ref={triggerRef}
      type="button"
    >
      <TriggerFace extended={extended} open={open} ringRef={ringRef} />
    </button>
  )
}

/** What the trigger shows: its surface, the arrival pill, reading progress and the glyph. */
function TriggerFace({
  extended,
  open,
  ringRef,
}: {
  extended: boolean
  open: boolean
  ringRef: RefObject<SVGCircleElement | null>
}) {
  return (
    <>
      <span
        className={cn(
          'absolute inset-0 rounded-full transition-[scale,background-color,box-shadow] duration-200 ease-(--ease-out-quint) motion-reduce:transition-none',
          // Keyboard focus: the primary ring outside the progress ring, a gap between.
          'group-focus-visible/trigger:ring-2 group-focus-visible/trigger:ring-primary group-focus-visible/trigger:ring-offset-2 group-focus-visible/trigger:ring-offset-background',
          open ? SURFACE.open : SURFACE.rest,
        )}
      />
      <Arrival extended={extended} />
      {/* Reading progress. Decorative: the accessible name carries it. */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90 transition-opacity duration-200 group-data-[arrival=extended]:opacity-0 group-data-[open=true]:opacity-0 motion-reduce:transition-none"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 56 56"
      >
        <circle className="stroke-foreground/10" cx="28" cy="28" r="25" />
        <circle
          cx="28"
          cy="28"
          pathLength="1"
          r="25"
          ref={ringRef}
          stroke="currentColor"
          strokeDasharray="1"
          strokeDashoffset="1"
          strokeLinecap="round"
        />
      </svg>
      <Glyph hidden={open || extended}>
        <IconList className="size-5" />
      </Glyph>
      <Glyph hidden={!open}>
        <IconX className="size-4" />
      </Glyph>
    </>
  )
}

/** The current section's number and name, on hover or keyboard focus of the trigger. */
function SectionHint({ label, number }: { label: string; number: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-full mr-2.5 flex h-7 -translate-y-1/2 items-center gap-2 rounded-lg bg-foreground px-2.5 text-xs/4 font-medium whitespace-nowrap text-background opacity-0 transition-opacity duration-150 group-data-[arrival=extended]:hidden peer-hover:opacity-100 peer-hover:delay-300 peer-focus-visible:opacity-100 motion-reduce:transition-none"
    >
      <span className="font-mono">{String(number).padStart(2, '0')}</span>
      {label}
    </span>
  )
}

/**
 * The icon swap: the outgoing glyph shrinks and blurs out as the incoming one
 * sharpens in, so the eye reads one mark changing rather than two trading.
 */
function Glyph({ hidden, children }: { hidden: boolean; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute transition-[opacity,scale,filter] duration-200 ease-(--ease-out-quint) motion-reduce:transition-none',
        hidden && 'scale-75 opacity-0 blur-xs',
      )}
    >
      {children}
    </span>
  )
}

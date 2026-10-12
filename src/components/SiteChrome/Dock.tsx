'use client'

import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSitePathname } from '@/hooks/use-site-pathname'
import { useChromeStore } from '@/stores/chromeStore'
import { onChromeScroll } from './chrome-scroll'
import { ArrowOutGlyph, AskGlyph, MenuGlyph } from './glyphs'
import type { OutboundLink } from './outbound'
import { PageTabs } from './PageTabs'
import type { ChromeTab, TabCurrent } from './tabs'
import { useBandGround } from './use-band-ground'

gsap.registerPlugin(Flip)

/** Phone tab bar: fold after this much downward travel, unfold after this much upward. */
const MINIMIZE_AFTER_PX = 48
const RESTORE_AFTER_PX = 24

/** Held back before the Ask tooltip shows, so a pass over the dock never flashes it. */
const TOOLTIP_DELAY_MS = 600

/** The Visit button's travel between its two phone homes; the fold itself is 200ms (globals.css). */
const LINK_TRAVEL_S = 0.36

/**
 * The phone bar's three states. `open`: the bar as the page shows it, at the
 * top or after scrolling up. `folded`: scrolled down, the bar is the Menu
 * pill. `opened`: unfolded by a tap on Menu, so a close button stands where
 * the pill was; the top of the page or a downward scroll settles it back.
 */
type Fold = 'open' | 'folded' | 'opened'

/**
 * Phones only: scrolling down folds the tab bar into the Menu pill so more
 * of the page shows; scrolling up, reaching the top, or a new page unfolds
 * it. Travel counts per direction, so a reader nudging the page back and
 * forth never flips it. `beforeChange` runs before every change, for a
 * measurement of the dock as it stands.
 */
function useDockFold(enabled: boolean, beforeChange: () => void) {
  const [fold, setFoldState] = useState<Fold>('open')
  const pathname = useSitePathname()
  const setFold = useCallback(
    (next: Fold | ((fold: Fold) => Fold)) => {
      beforeChange()
      setFoldState(next)
    },
    [beforeChange],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies(pathname): a new page unfolds the bar
  useEffect(() => {
    setFoldState('open')
    if (!enabled) return
    let last = window.scrollY
    let travel = 0
    return onChromeScroll((scrollY) => {
      const delta = scrollY - last
      last = scrollY
      if (delta === 0) return
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta
      if (scrollY <= MINIMIZE_AFTER_PX) setFold('open')
      else if (travel < -RESTORE_AFTER_PX) setFold((fold) => (fold === 'folded' ? 'open' : fold))
      else if (travel > MINIMIZE_AFTER_PX) setFold('folded')
    })
  }, [enabled, pathname, setFold])

  return [fold, setFold] as const
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

/**
 * The folded bar: one Menu pill, the same on every page. Where the reader
 * is belongs to the top bar; the pill only opens the pages. A tap unfolds
 * the bar in place. The pill is a label on the slot's glass plate, not a
 * surface of its own: the plate shrinks to the pill's width (`useMenuWidth`
 * measures it) and the Visit button takes the room left beside it.
 */
function DockMenu({
  minimized,
  onOpen,
  menuRef,
}: {
  minimized: boolean
  onOpen: () => void
  menuRef: RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      aria-expanded={!minimized}
      aria-hidden={!minimized}
      aria-label="Show pages"
      className="dock-menu chrome-focus"
      data-shown={minimized || undefined}
      onClick={onOpen}
      ref={menuRef}
      tabIndex={minimized ? 0 : -1}
      type="button"
    >
      <span className="dock-menu-fill">
        <MenuGlyph className="size-4" />
        Menu
      </span>
    </button>
  )
}

/**
 * The page's live site, offered beside the dock. Desktop: pinned to the
 * right edge of the content column, beside the centred dock. Phone: above
 * the bar, edge to edge; when the bar folds, filling the room between the
 * Menu pill and Ask. One element in both homes: the dock moves and resizes
 * it with a FLIP (`Dock`), so it travels instead of swapping.
 */
function DockLink({
  link,
  linkRef,
}: {
  link: OutboundLink
  linkRef: RefObject<HTMLAnchorElement | null>
}) {
  return (
    <div className="dock-link-slot">
      <a
        className="dock-link chrome-focus pressable"
        href={link.href}
        ref={linkRef}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span>{link.label}</span>
        <ArrowOutGlyph className="dock-link-arrow size-3.5" />
      </a>
    </div>
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

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hands the Menu pill's width to the dock as `--dock-menu-w`, which places
 * the folded Visit button's slot. Measured here, in the parent, because a
 * child's layout effect runs before the parent's ref is attached.
 */
function useMenuWidth(
  dockRef: RefObject<HTMLDivElement | null>,
  menuRef: RefObject<HTMLButtonElement | null>,
  present: boolean,
) {
  useLayoutEffect(() => {
    const dock = dockRef.current
    const pill = menuRef.current
    if (!dock || !pill || !present) return
    const measure = () => dock.style.setProperty('--dock-menu-w', `${pill.offsetWidth}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(pill)
    return () => observer.disconnect()
  }, [dockRef, menuRef, present])
}

/**
 * The bottom of the chrome: the pages, Ask beside them as its own action,
 * and, on a page with a live site, the Visit button. The three never share
 * a control, so a visitor always knows which one navigates, which one starts
 * a conversation, and which one leaves.
 *
 * The dock samples the band under it and wears that band's ground: its dark
 * material over a dark one, its light glass over a light one. While Ask is
 * open the tabs and the Visit button step back (fade, 0.96, blur) and the
 * Ask field takes the button's place.
 */
export function Dock({ tabs, active, current, onSelect, ask }: DockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const ground = useBandGround(ref)
  const phone = useIsMobile()
  const link = useChromeStore((state) => state.link)

  // The Visit button as it stood before the fold changed: the FLIP's start.
  const linkFrom = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const recordLink = useCallback(() => {
    if (linkRef.current) linkFrom.current = Flip.getState(linkRef.current)
  }, [])
  const [fold, setFold] = useDockFold(phone === true && active >= 0, recordLink)
  const minimized = fold === 'folded'
  useMenuWidth(ref, menuRef, active >= 0)

  // Opened by a tap: a tap outside the dock or Escape folds it again.
  useEffect(() => {
    if (fold !== 'opened') return
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setFold('folded')
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setFold('folded')
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fold, setFold])

  // Keyboard: focus follows the Menu pill into the close button that replaces it.
  useEffect(() => {
    if (fold === 'opened' && document.activeElement?.classList.contains('dock-menu'))
      closeRef.current?.focus()
  }, [fold])

  // The Visit button travels between its homes from where it stood, its
  // width going with it (the one width tween the chrome allows: a single
  // small element, the label centred throughout), so a fold reversed
  // mid-flight turns back without a jump. Reduced motion: it fades into the
  // new home instead.
  // biome-ignore lint/correctness/useExhaustiveDependencies(fold): runs after every fold change
  useLayoutEffect(() => {
    const from = linkFrom.current
    linkFrom.current = null
    const el = linkRef.current
    if (!from || !el || !phone) return
    gsap.killTweensOf(el)
    gsap.set(el, { clearProps: 'transform,width' })
    if (reducedMotion()) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
      return
    }
    Flip.from(from, {
      duration: LINK_TRAVEL_S,
      ease: 'quint.out',
      onStart: () => el.setAttribute('data-flying', ''),
      onComplete: () => el.removeAttribute('data-flying'),
      onInterrupt: () => el.removeAttribute('data-flying'),
    })
  }, [fold, phone])

  return (
    <div
      className="dock"
      data-chrome=""
      data-ask={ask?.open ? 'open' : ask?.present ? 'closing' : undefined}
      data-minimized={minimized || undefined}
      data-theme={ground}
      ref={ref}
    >
      <div className="dock-tabs-slot">
        <span aria-hidden className="dock-plate chrome-material" />
        <PageTabs
          active={active}
          closeRef={closeRef}
          current={current}
          minimized={minimized}
          onClose={fold === 'opened' ? () => setFold('folded') : null}
          onSelect={onSelect}
          tabs={tabs}
        />
        {active >= 0 && (
          <DockMenu menuRef={menuRef} minimized={minimized} onOpen={() => setFold('opened')} />
        )}
      </div>

      {link && <DockLink link={link} linkRef={linkRef} />}

      {ask && <DockAskButton ask={ask} />}
    </div>
  )
}

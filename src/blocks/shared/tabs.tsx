'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import {
  cancelTabSwap,
  playTabSwap,
  reverseTabSwap,
  type SwapDirection,
  TAB_SWAP_MOTION,
  type TabSwap,
  tabSwapSettled,
} from './tab-swap'

export type TabSize = 'default' | 'small'

/** What every tabbed block's rows carry, whatever else they hold. */
export type TabbedRow = { id?: string | null; title?: string | null }

/**
 * Below `md` every strip is one rail on a hairline: a row that wraps into
 * centred lines of different lengths reads as loose words, not a control.
 * The rail bleeds to the page gutter so a half-cut tab, not a scrollbar, is
 * the pan affordance, and `scroll-fade-x` dims only the edge with tabs still
 * behind it. Triggers stand 44px tall there, so each label is a full touch
 * target, and the active one's ink sits on the hairline.
 *
 * From `md`, default: heading-sized triggers that wrap onto a second row once
 * the labels outgrow the container (fine up to four tabs). Small: one type
 * step down (`text-lead`, the same step Image statement takes) and never
 * wraps; past the container it keeps panning. `justify-center-safe` keeps
 * the row centred while it fits and falls back to start alignment once it
 * overflows, so the first tab can never be scrolled out of reach.
 */
const RAIL =
  'no-scrollbar scroll-fade-x scroll-fade-8 relative -mx-gutter flex items-center gap-6 overflow-x-auto overscroll-x-contain px-gutter max-md:shadow-[inset_0_-1px_0_var(--color-border)]'

const TAB_STRIP = {
  default: cn(
    RAIL,
    'md:mx-0 md:flex-wrap md:justify-center md:gap-x-24 md:gap-y-4 md:overflow-visible md:px-0',
  ),
  small: cn(RAIL, 'justify-start md:justify-center-safe md:gap-12'),
} as const

const TAB_TRIGGER = {
  default: 'h-11 text-lead md:h-auto md:pb-3 md:text-heading-3',
  small: 'h-11 text-lead md:h-auto md:pb-3',
} as const

/** A row's Radix value, for a block that draws its own triggers (Carousel tabs' index). */
export const valueFor = (rows: TabbedRow[], index: number) => rows[index]?.id ?? String(index)

/** The active tab's value, for blocks that render per-tab things outside the panels. */
const TabbedValue = createContext<string | null>(null)

/** The active tab's value, for a block that draws its own panels (Carousel tabs' deck). */
export const useActiveValue = () => useContext(TabbedValue)

/** The active row, for a block that renders something per tab outside its panel. */
export const useActiveRow = <Row extends TabbedRow>(rows: Row[]): Row | undefined => {
  const value = useActiveValue()
  return rows.find((_, index) => valueFor(rows, index) === value)
}

/**
 * The Radix root on its own, for a block whose strip and panels sit in
 * different cells (Carousel tabs: strip under the copy, deck beside it). The
 * root must wrap both, so the block places its triggers and panels itself.
 */
export const TabbedRoot = ({
  children,
  className,
  orientation,
  rows,
}: {
  children: React.ReactNode
  className?: string
  /** `vertical` when the triggers stack, so arrow keys follow them up and down. */
  orientation?: 'horizontal' | 'vertical'
  rows: TabbedRow[]
}) => {
  const [value, setValue] = useState(() => valueFor(rows, 0))
  return (
    <TabsPrimitive.Root
      className={className}
      data-reveal
      onValueChange={setValue}
      orientation={orientation}
      value={value}
    >
      <TabbedValue.Provider value={value}>{children}</TabbedValue.Provider>
    </TabsPrimitive.Root>
  )
}

/** Places the ink under the active trigger: one pixel wide, scaled to the label. */
const placeInk = (list: HTMLElement, ink: HTMLElement) => {
  const trigger = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
  if (!trigger) return false
  const y = trigger.offsetTop + trigger.offsetHeight - ink.offsetHeight
  ink.style.transform = `translate(${trigger.offsetLeft}px, ${y}px) scaleX(${trigger.offsetWidth})`
  return true
}

/** Brings the active tab to the middle of a panning rail, without moving the page. */
const centreActive = (list: HTMLElement, behavior: ScrollBehavior) => {
  if (list.scrollWidth <= list.clientWidth) return
  const trigger = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
  if (!trigger) return
  const left = trigger.offsetLeft - (list.clientWidth - trigger.offsetWidth) / 2
  list.scrollTo({ left, behavior })
}

/**
 * The strip's ink: a rule under the active label that travels to the chosen
 * tab on the swap's curve (`TAB_SWAP_MOTION.ink`), so the strip moves the
 * same way the panel does. It lands without travel on first paint and on
 * resize, where motion would only report the layout settling.
 */
const useTabInk = (value: string | null) => {
  const listRef = useRef<HTMLDivElement>(null)
  const inkRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const list = listRef.current
    const ink = inkRef.current
    if (!list || !ink || value === null) return
    const travel = placed.current && !reduced
    ink.style.transition = travel
      ? `transform ${TAB_SWAP_MOTION.ink}ms ${TAB_SWAP_MOTION.ease}`
      : 'none'
    placed.current = placeInk(list, ink)
    if (travel) centreActive(list, 'smooth')
  }, [value, reduced])

  useEffect(() => {
    const list = listRef.current
    const ink = inkRef.current
    if (!list || !ink) return
    const observer = new ResizeObserver(() => {
      ink.style.transition = 'none'
      placeInk(list, ink)
      centreActive(list, 'instant')
    })
    // The triggers too: a webfont landing changes a label's width, not the strip's.
    for (const el of [list, ...list.querySelectorAll('[role="tab"]')]) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { inkRef, listRef }
}

const TabStrip = ({
  ariaLabel,
  rows,
  tabSize,
}: {
  ariaLabel: string
  rows: TabbedRow[]
  tabSize?: TabSize | null
}) => {
  const size = tabSize === 'small' ? 'small' : 'default'
  const { inkRef, listRef } = useTabInk(useActiveValue())
  return (
    <TabsPrimitive.List aria-label={ariaLabel} className={TAB_STRIP[size]} ref={listRef}>
      {rows.map((row, index) => (
        <TabsPrimitive.Trigger
          key={row.id ?? index}
          value={valueFor(rows, index)}
          className={cn(
            'text-muted-foreground hover:text-foreground data-[state=active]:text-primary shrink-0 whitespace-nowrap',
            'touch-manipulation select-none [-webkit-tap-highlight-color:transparent]',
            'transition-[color,scale] duration-360 ease-(--ease-out-quint) active:scale-[0.97] motion-reduce:transition-none',
            'focus-visible:outline-ring rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-2',
            TAB_TRIGGER[size],
          )}
        >
          {row.title}
        </TabsPrimitive.Trigger>
      ))}
      <span
        aria-hidden="true"
        className="bg-primary pointer-events-none absolute top-0 left-0 h-0.5 w-px origin-left"
        ref={inkRef}
      />
    </TabsPrimitive.List>
  )
}

type Layer = { swap?: TabSwap; value: string }

/**
 * The panels as a stack of layers: at rest one, during a swap the outgoing
 * under the incoming (see ./tab-swap). The active layer stays in flow, so
 * the block takes the new panel's height the moment a tab is chosen and the
 * page moves once, with the tap; the layers it covers sit over it, pinned to
 * its top edge and clipped to it, inert until the swap has landed.
 *
 * Interruptible: choosing the tab just left while its successor is still
 * arriving runs that swap back; choosing any other stacks a new swap on top,
 * and each swap that lands clears the layers under it.
 */
const TabPanels = <Row extends TabbedRow>({
  renderPanel,
  rows,
}: {
  renderPanel: (row: Row) => React.ReactNode
  rows: Row[]
}) => {
  const value = useActiveValue() ?? valueFor(rows, 0)
  const reduced = usePrefersReducedMotion()
  const [layers, setLayers] = useState<Layer[]>(() => [{ value }])
  const nodes = useRef(new Map<string, HTMLElement>())
  const previous = useRef(value)
  const live = useRef({ layers, reduced })
  live.current = { layers, reduced }

  const pending = useRef<{ direction: SwapDirection; from: string } | null>(null)

  /**
   * Clears a swap once it lands. Only the animations on layers that stay are
   * cancelled: a layer on its way out keeps its last frame until it unmounts,
   * or it would flash back for a frame.
   */
  const land = useCallback((swap: TabSwap, incoming: string) => {
    void tabSwapSettled(swap).then(() => {
      const top = live.current.layers.find((layer) => layer.value === incoming)
      if (top?.swap !== swap) return
      const node = nodes.current.get(incoming)
      const onIncoming = (animation: Animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        return Boolean(target && node?.contains(target))
      }
      const stays = swap.reversed ? (a: Animation) => !onIncoming(a) : onIncoming
      for (const animation of swap.animations) if (stays(animation)) animation.cancel()
      setLayers((current) => {
        if (swap.reversed) return current.filter((layer) => layer.value !== incoming)
        const at = current.findIndex((layer) => layer.value === incoming)
        return at < 0 ? current : [{ value: incoming }, ...current.slice(at + 1)]
      })
    })
  }, [])

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = value
    if (value === from) return
    const current = live.current.layers
    const top = current.at(-1)
    const below = current.at(-2)

    // Back to the tab just left, or forward again: run the swap the other way.
    const returning = top?.swap && top.value === from && below?.value === value
    const resuming = top?.swap?.reversed && top.value === value
    if (top?.swap && (returning || resuming)) {
      reverseTabSwap(top.swap)
      land(top.swap, top.value)
      return
    }

    const index = (v: string) => rows.findIndex((_, i) => valueFor(rows, i) === v)
    const direction: SwapDirection = index(value) < index(from) ? -1 : 1
    for (const layer of current) if (layer.value === value) cancelTabSwap(layer.swap)
    setLayers([...current.filter((layer) => layer.value !== value), { value }])
    pending.current = { direction, from }
  }, [value, rows, land])

  useLayoutEffect(() => {
    const next = pending.current
    if (!next) return
    pending.current = null
    const incoming = layers.at(-1)?.value
    if (!incoming) return
    const swap = playTabSwap({
      direction: next.direction,
      incoming: nodes.current.get(incoming),
      outgoing: nodes.current.get(next.from),
      reduced: live.current.reduced,
    })
    setLayers((current) =>
      current.map((layer) => (layer.value === incoming ? { ...layer, swap } : layer)),
    )
    live.current.layers = live.current.layers.map((layer) =>
      layer.value === incoming ? { ...layer, swap } : layer,
    )
    land(swap, incoming)
  }, [layers, land])

  useEffect(
    () => () => {
      for (const layer of live.current.layers) cancelTabSwap(layer.swap)
    },
    [],
  )

  const stacked = layers.length > 1

  return (
    <div className={cn('relative', stacked && 'overflow-clip')}>
      {rows.map((row, index) => {
        const rowValue = valueFor(rows, index)
        const depth = layers.findIndex((layer) => layer.value === rowValue)
        const behind = depth >= 0 && rowValue !== value
        return (
          <TabsPrimitive.Content
            aria-hidden={behind || undefined}
            className={cn(behind && 'absolute inset-x-0 top-0')}
            forceMount={depth >= 0 || undefined}
            inert={behind || undefined}
            key={row.id ?? index}
            ref={(node) => {
              if (node) nodes.current.set(rowValue, node)
              else nodes.current.delete(rowValue)
            }}
            style={depth >= 0 && stacked ? { zIndex: depth } : undefined}
            value={rowValue}
          >
            {renderPanel(row)}
          </TabsPrimitive.Content>
        )
      })}
    </div>
  )
}

/**
 * The tabbed shell every tabbed block renders: a strip of triggers and one
 * panel below it, only the active panel painted at rest (two only while a
 * swap runs, see `TabPanels`).
 *
 * Stated once so every tabbed block switches, pans and highlights the same
 * way; a block supplies only what a panel looks like and marks its parts for
 * the swap (./tab-swap). The strip and the panels stack on a scale step
 * (grid doc, G6) carried by a flex column `gap`; tighter on a phone, where
 * the strip is the panel's own control and belongs right above it.
 *
 * Under a GSAP reveal (`data-reveal` on the root) the strip and the panel
 * each enter whole: a panel that swaps on click cannot split into lines.
 */
export const TabbedPanels = <Row extends TabbedRow>({
  ariaLabel,
  renderPanel,
  rows,
  tabSize,
}: {
  ariaLabel: string
  renderPanel: (row: Row) => React.ReactNode
  rows: Row[]
  tabSize?: TabSize | null
}) => {
  if (rows.length === 0) return null

  return (
    <TabbedRoot className="flex flex-col gap-8 md:gap-12 lg:gap-16" rows={rows}>
      <TabStrip ariaLabel={ariaLabel} rows={rows} tabSize={tabSize} />
      <TabPanels renderPanel={renderPanel} rows={rows} />
    </TabbedRoot>
  )
}

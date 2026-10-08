'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { cn } from '@/utilities/ui'

export type TabSize = 'default' | 'small'

/** What every tabbed block's rows carry, whatever else they hold. */
export type TabbedRow = { id?: string | null; title?: string | null }

/**
 * Default strip: heading-sized triggers that wrap onto a second row once the
 * labels outgrow the container (fine up to four tabs).
 *
 * Small strip: one type step down (`text-lead`, the same step Image statement
 * takes) and never wraps. Past the container it pans instead, the same rail
 * AudienceTabs uses below `md`: the strip bleeds to the page gutter so a
 * half-cut tab, not a scrollbar, is the affordance, and `scroll-fade-x` dims
 * only the edge with tabs still behind it. `justify-center-safe` keeps the
 * row centered while it fits and falls back to start alignment once it
 * overflows, so the first tab can never be scrolled out of reach.
 *
 * `-my-1 / py-1` is layout-neutral padding, not spacing: `overflow-x-auto`
 * clips on the block axis too, and without the room the triggers' focus ring
 * would be cropped.
 */
const TAB_STRIP = {
  default: 'flex flex-wrap items-center gap-y-3 md:gap-y-4',
  small:
    'no-scrollbar scroll-fade-x scroll-fade-8 -my-1 flex items-center gap-6 overflow-x-auto overscroll-x-contain py-1 md:gap-12',
} as const

/**
 * The strip is centred under the full-width shell. A wrapped default strip
 * keeps its rows tight. The small rail bleeds to the page gutter so a
 * half-cut tab is the pan affordance.
 */
const TAB_ALIGN = {
  default: 'justify-center gap-x-8 md:gap-x-24',
  small: 'justify-center-safe -mx-gutter pe-gutter ps-gutter',
} as const

const TAB_TRIGGER = {
  default: 'text-heading-3',
  small: 'shrink-0 text-lead whitespace-nowrap',
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

export const TabStrip = ({
  ariaLabel,
  rows,
  tabSize,
}: {
  ariaLabel: string
  rows: TabbedRow[]
  tabSize?: TabSize | null
}) => {
  const size = tabSize === 'small' ? 'small' : 'default'
  return (
    <TabsPrimitive.List aria-label={ariaLabel} className={cn(TAB_STRIP[size], TAB_ALIGN[size])}>
      {rows.map((row, index) => (
        <TabsPrimitive.Trigger
          key={row.id ?? index}
          value={valueFor(rows, index)}
          className={cn(
            'text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary',
            TAB_TRIGGER[size],
          )}
        >
          {row.title}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  )
}

/** The panels sit in one wrapper so a stacking gap is taken once. */
const TabPanels = <Row extends TabbedRow>({
  renderPanel,
  rows,
}: {
  renderPanel: (row: Row) => React.ReactNode
  rows: Row[]
}) => (
  <div>
    {rows.map((row, index) => (
      <TabsPrimitive.Content key={row.id ?? index} value={valueFor(rows, index)}>
        {renderPanel(row)}
      </TabsPrimitive.Content>
    ))}
  </div>
)

/**
 * The tabbed shell every tabbed block renders: a centered strip of triggers
 * and one panel below it, only the active panel painted (Radix mounts one at
 * a time, so at most one panel's media is ever live).
 *
 * Stated once so Tabs and Carousel tabs switch, wrap, pan and highlight
 * identically; a block supplies only what a panel looks like. The strip and
 * the panels stack on a scale step (grid doc, G6) carried by a flex column
 * `gap` rather than `space-y-*`: `space-y` is a margin on the strip, which
 * the small rail's layout-neutral `-my-1` would override.
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
    <TabbedRoot className="flex flex-col gap-12 md:gap-16" rows={rows}>
      <TabStrip ariaLabel={ariaLabel} rows={rows} tabSize={tabSize} />
      <TabPanels renderPanel={renderPanel} rows={rows} />
    </TabbedRoot>
  )
}

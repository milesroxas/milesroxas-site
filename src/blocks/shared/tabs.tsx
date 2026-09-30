'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
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
  default: 'flex flex-wrap items-center gap-8 md:gap-24',
  small:
    'no-scrollbar scroll-fade-x scroll-fade-8 -my-1 flex items-center gap-6 overflow-x-auto overscroll-x-contain py-1 md:gap-12',
} as const

/**
 * Where the strip sits in its column. `center` is the full-width shell's
 * (Tabs); `start` is a strip that shares a grid row with a copy column
 * (Carousel tabs), where a centred strip would not line up with anything.
 *
 * The centred small rail bleeds to the page gutter so a half-cut tab is the
 * pan affordance; a strip inside a grid cell is already inset, so it pans
 * within its cell instead.
 */
const TAB_ALIGN = {
  center: {
    default: 'justify-center',
    small: 'justify-center-safe -mx-gutter pe-gutter ps-gutter',
  },
  start: { default: 'justify-start', small: 'justify-start' },
} as const

const TAB_TRIGGER = {
  default: 'text-heading-3',
  small: 'shrink-0 text-lead whitespace-nowrap',
} as const

/**
 * The tabbed shell every tabbed block renders: a centered strip of triggers
 * and one panel below it, only the active panel painted (Radix mounts one at
 * a time, so at most one panel's media is ever live).
 *
 * Stated once so Tabs and Carousel tabs switch, wrap, pan and highlight
 * identically; a block supplies only what a panel looks like. The strip and
 * the panels stack on a scale step (grid doc, G6) carried by a flex column
 * `gap` rather than `space-y-*`: `space-y` is a margin on the strip, which
 * the small rail's layout-neutral `-my-1` would override. The panels sit in
 * one wrapper so the step is taken once.
 *
 * `data-reveal` marks the whole shell as one beat for a GSAP reveal: a strip
 * whose panels swap on click cannot stagger its contents.
 */
export const TabbedPanels = <Row extends TabbedRow>({
  align = 'center',
  ariaLabel,
  renderPanel,
  rows,
  tabSize,
}: {
  align?: keyof typeof TAB_ALIGN
  ariaLabel: string
  renderPanel: (row: Row) => React.ReactNode
  rows: Row[]
  tabSize?: TabSize | null
}) => {
  if (rows.length === 0) return null
  const size = tabSize === 'small' ? 'small' : 'default'
  const valueFor = (index: number) => rows[index]?.id ?? String(index)

  return (
    <TabsPrimitive.Root
      className="flex flex-col gap-12 md:gap-16"
      data-reveal
      defaultValue={valueFor(0)}
    >
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className={cn(TAB_STRIP[size], TAB_ALIGN[align][size])}
      >
        {rows.map((row, index) => (
          <TabsPrimitive.Trigger
            key={row.id ?? index}
            value={valueFor(index)}
            className={cn(
              'text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary',
              TAB_TRIGGER[size],
            )}
          >
            {row.title}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      <div>
        {rows.map((row, index) => (
          <TabsPrimitive.Content key={row.id ?? index} value={valueFor(index)}>
            {renderPanel(row)}
          </TabsPrimitive.Content>
        ))}
      </div>
    </TabsPrimitive.Root>
  )
}

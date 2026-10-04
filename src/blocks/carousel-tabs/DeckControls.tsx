'use client'

import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { useEffect, useState } from 'react'
import { type TabSize, useActiveRow, valueFor } from '@/blocks/shared/tabs'
import type { CarouselApi } from '@/components/ui/carousel'
import type { CarouselTabsBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Tab = NonNullable<CarouselTabsBlock['tabs']>[number]

/** Slides the deck will render: uploads a depth-starved query left as ids are skipped there too. */
const renderableCount = (tab: Tab | undefined) =>
  (tab?.slides ?? []).filter((slide) => slide.media && typeof slide.media === 'object').length

/**
 * The active deck's slide and slide count. Until embla reports (server
 * render, and the beat between a tab change and the new deck mounting) it is
 * the tab's first slide of its own count, so the first paint already reads
 * right.
 */
const useDeckPosition = (api: CarouselApi, count: number) => {
  const [position, setPosition] = useState({ index: 0, total: count })

  useEffect(() => {
    if (!api) {
      setPosition({ index: 0, total: count })
      return
    }
    const sync = () =>
      setPosition({ index: api.selectedScrollSnap(), total: api.scrollSnapList().length })
    sync()
    api.on('select', sync).on('reInit', sync)
    return () => {
      api.off('select', sync).off('reInit', sync)
    }
  }, [api, count])

  return position
}

/** Row height and type: `small` is the tighter index for five or more tabs. */
const ROW = {
  default: 'h-12 text-lg',
  small: 'h-10 text-base',
} as const

/**
 * The tabs as an index: one row per deck between hairlines, in the
 * same rule-and-mono language as the readout below it. The active row's
 * hairline is the deck's progress: a thumb one slide's share of the row
 * wide, riding to the current slide. Changing tab draws the thumb out of
 * the new row's left edge as the old one retracts, so the progress visibly
 * moves to the deck it now measures.
 *
 * Inactive rows read as links to the other decks: muted ink, a hairline that
 * darkens on hover with an arrow sliding in at the row's end, and a short
 * dip on press. The active row is settled: full ink, no arrow.
 */
const DeckIndex = ({
  index,
  rows,
  tabSize,
  total,
}: {
  index: number
  rows: Tab[]
  tabSize?: TabSize | null
  total: number
}) => {
  const size = tabSize === 'small' ? 'small' : 'default'
  return (
    <TabsPrimitive.List
      aria-label="Carousel tabs"
      className="flex flex-col border-foreground/10 border-t"
    >
      {rows.map((row, rowIndex) => (
        <TabsPrimitive.Trigger
          className={cn(
            'group relative flex w-full items-center justify-between gap-4 text-left text-muted-foreground',
            'transition-colors duration-150 ease-(--ease-out-quint) hover:text-foreground data-[state=active]:text-foreground',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            ROW[size],
          )}
          key={row.id ?? rowIndex}
          value={valueFor(rows, rowIndex)}
        >
          <span className="origin-left truncate transition-[scale] duration-150 ease-(--ease-out-quint) group-active:scale-[0.98] group-data-[state=active]:group-active:scale-100 motion-reduce:transition-none">
            {row.title}
          </span>
          <IconArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,translate] duration-200 ease-(--ease-out-quint) group-hover:translate-x-0 group-hover:opacity-100 group-data-[state=active]:hidden motion-reduce:transition-none"
            stroke={1.75}
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-foreground/10 transition-colors duration-150 group-hover:bg-foreground/25 group-data-[state=active]:bg-foreground/10"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-(--ease-out-quint) group-data-[state=active]:scale-x-100 motion-reduce:transition-none"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-transform duration-500 ease-(--ease-out-quint) motion-reduce:transition-none"
              style={{
                width: `${100 / Math.max(total, 1)}%`,
                transform: `translateX(${index * 100}%)`,
              }}
            />
          </span>
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  )
}

/**
 * Round and quiet, so they read as the deck's transport rather than a call to
 * action. The `::after` pads the 36px mark out to a 48px touch target.
 */
const STEP_BUTTON = cn(
  'relative inline-flex size-9 items-center justify-center rounded-full text-foreground ring-1 ring-foreground/10 ring-inset',
  'transition-[background-color,scale] duration-150 ease-(--ease-out-quint) motion-reduce:transition-none',
  'hover:bg-foreground/[0.06] active:scale-[0.94]',
  'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
  'after:absolute after:-inset-1.5',
)

const pad = (n: number) => String(n).padStart(2, '0')

/** The slide index in the eyebrow's mono, and previous/next. */
const DeckReadout = ({ api, index, total }: { api: CarouselApi; index: number; total: number }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <p aria-live="polite" className="font-medium font-mono text-xs/none tabular-nums">
        <span aria-hidden="true">
          {pad(index + 1)}
          <span className="text-muted-foreground"> / {pad(total)}</span>
        </span>
        <span className="sr-only">
          Slide {index + 1} of {total}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous slide"
          className={STEP_BUTTON}
          onClick={() => api?.scrollPrev()}
          type="button"
        >
          <IconChevronLeft aria-hidden="true" className="size-4" stroke={1.75} />
        </button>
        <button
          aria-label="Next slide"
          className={STEP_BUTTON}
          onClick={() => api?.scrollNext()}
          type="button"
        >
          <IconChevronRight aria-hidden="true" className="size-4" stroke={1.75} />
        </button>
      </div>
    </div>
  )
}

/**
 * The foot of the copy column: the tab index, then the readout. It sits on
 * the deck's bottom edge (see ./CarouselTabs), so the column reads as the
 * deck's caption and transport rather than copy beside it. `api` is the
 * active deck's: Radix mounts one panel at a time.
 */
export const DeckControls = ({
  api,
  rows,
  tabSize,
}: {
  api: CarouselApi
  rows: Tab[]
  tabSize?: TabSize | null
}) => {
  const { index, total } = useDeckPosition(api, renderableCount(useActiveRow(rows)))
  return (
    <div className="flex flex-col gap-6">
      <DeckIndex index={index} rows={rows} tabSize={tabSize} total={total} />
      {total > 1 && <DeckReadout api={api} index={index} total={total} />}
    </div>
  )
}

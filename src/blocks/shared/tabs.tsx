'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { createContext, useContext, useState } from 'react'

export type TabSize = 'default' | 'small'

/** What every tabbed block's rows carry, whatever else they hold. */
export type TabbedRow = { id?: string | null; title?: string | null }

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

'use client'

import gsap from 'gsap'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { type TabbedRow, useActiveValue, valueFor } from '@/blocks/shared/tabs'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { DECK_SWAP_MOTION } from './motion'

/**
 * A swap in flight: `incoming` shows above the moving edge, `outgoing` below
 * it, and `target` is where the edge is headed (1 the foot, 0 back to the top).
 */
type Swap = { incoming: string; outgoing: string; target: 0 | 1 }

/** How far the mask reaches past the frame, so the stack's fan and shadows are not cut. */
const REACH = '4rem'

const clearSwapStyles = (node: HTMLElement | undefined) => {
  if (!node) return
  node.style.clipPath = ''
  node.style.opacity = ''
}

/**
 * Resolves once the deck's first picture can paint, or after `hold` ms: the
 * old deck stays up until then, so the wipe uncovers a picture, not a plate.
 * The deck's pictures turn eager first: a lazy image under the closed mask
 * counts as out of view and would not start until the edge moved.
 */
const whenFirstPictureReady = (panel: HTMLElement | undefined, hold: number) =>
  new Promise<void>((resolve) => {
    const pictures = panel?.querySelectorAll<HTMLImageElement>('[data-carousel-frame] picture img')
    for (const picture of pictures ?? []) picture.loading = 'eager'
    const img = pictures?.[0]
    if (!img || (img.complete && img.naturalWidth > 0)) return resolve()
    const timer = setTimeout(resolve, hold)
    img
      .decode()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        resolve()
      })
  })

/**
 * The decks, swapped with the site's top-down mask: one edge travels down the
 * frame with the new deck above it and the old one below, so the frame is
 * never empty and the change reads as one plate replacing another. Both
 * decks share a grid cell (the frame keeps their height equal, see
 * `sharedDeckFrame`); the old one is held mounted, inert, until the edge
 * passes.
 *
 * The edge waits for the new deck's first picture (`hold` at most) while the
 * index row says it is loading. Interruptible: picking the old tab mid-swap
 * sends the edge back up; picking a third replaces the deck above the edge
 * and the edge carries on. Reduced motion crossfades instead.
 */
export const DeckPanels = <Row extends TabbedRow>({
  className,
  onPendingChange,
  renderPanel,
  rows,
}: {
  className?: string
  onPendingChange: (pending: boolean) => void
  renderPanel: (row: Row, active: boolean) => React.ReactNode
  rows: Row[]
}) => {
  const value = useActiveValue() ?? valueFor(rows, 0)
  const [shown, setShown] = useState(value)
  const [swap, setSwap] = useState<Swap | null>(null)
  const reduced = usePrefersReducedMotion()

  const nodes = useRef(new Map<string, HTMLElement>())
  const progress = useRef({ p: 0 })
  const tween = useRef<{ target: number; tween: gsap.core.Tween } | null>(null)
  const run = useRef(0)
  const live = useRef({ onPendingChange, reduced, shown, swap })
  live.current = { onPendingChange, reduced, shown, swap }

  const paint = () => {
    const current = live.current.swap
    if (!current) return
    const { p } = progress.current
    const incoming = nodes.current.get(current.incoming)
    const outgoing = nodes.current.get(current.outgoing)
    if (live.current.reduced) {
      if (incoming) incoming.style.opacity = String(p)
      if (outgoing) outgoing.style.opacity = String(1 - p)
      return
    }
    const span = `(100% + 2 * ${REACH})`
    if (incoming) {
      incoming.style.clipPath = `inset(-${REACH} -100vw calc(${(1 - p).toFixed(4)} * ${span} - ${REACH}) -100vw)`
    }
    if (outgoing) {
      outgoing.style.clipPath = `inset(calc(${p.toFixed(4)} * ${span} - ${REACH}) -100vw -${REACH} -100vw)`
    }
  }

  const settle = () => {
    const current = live.current.swap
    if (!current) return
    const next = progress.current.p >= 1 ? current.incoming : current.outgoing
    clearSwapStyles(nodes.current.get(next))
    progress.current.p = 0
    tween.current = null
    setShown(next)
    setSwap(null)
  }

  const drive = (target: 0 | 1) => {
    if (tween.current?.target === target && tween.current.tween.isActive()) return
    tween.current?.tween.kill()
    const { fade, wipe } = DECK_SWAP_MOTION
    const distance = Math.abs(target - progress.current.p)
    if (distance === 0) {
      settle()
      return
    }
    tween.current = {
      target,
      tween: gsap.to(progress.current, {
        p: target,
        duration: (live.current.reduced ? fade : wipe.duration) * distance,
        ease: live.current.reduced ? 'none' : wipe.ease,
        onUpdate: paint,
        onComplete: settle,
      }),
    }
  }

  useLayoutEffect(() => {
    setSwap((current) => {
      if (!current) {
        const from = live.current.shown
        return value === from ? null : { incoming: value, outgoing: from, target: 1 }
      }
      if (value === current.outgoing) return { ...current, target: 0 }
      if (value === current.incoming && current.target === 1) return current
      return { ...current, incoming: value, target: 1 }
    })
  }, [value])

  // biome-ignore lint/correctness/useExhaustiveDependencies: paint and drive read live refs
  useLayoutEffect(() => {
    if (!swap) return
    paint()
    const token = ++run.current
    const waiting = swap.target === 1 && progress.current.p === 0 && !tween.current
    if (!waiting) {
      drive(swap.target)
      return
    }
    live.current.onPendingChange(true)
    whenFirstPictureReady(nodes.current.get(swap.incoming), DECK_SWAP_MOTION.hold).then(() => {
      if (run.current !== token) return
      live.current.onPendingChange(false)
      // The next frame, so the hold's last style writes land before the edge moves.
      requestAnimationFrame(() => {
        if (run.current === token) drive(1)
      })
    })
    return () => {
      if (run.current === token) live.current.onPendingChange(false)
    }
  }, [swap])

  useEffect(
    () => () => {
      run.current++
      tween.current?.tween.kill()
    },
    [],
  )

  const held = swap ? [swap.incoming, swap.outgoing] : [shown]

  return (
    <div className={cn('grid', className)}>
      {rows.map((row, index) => {
        const rowValue = valueFor(rows, index)
        const isHeld = held.includes(rowValue)
        const behind = isHeld && rowValue !== value
        return (
          <TabsPrimitive.Content
            aria-hidden={behind || undefined}
            className="[grid-area:1/1]"
            forceMount={isHeld || undefined}
            inert={behind || undefined}
            key={row.id ?? index}
            ref={(node) => {
              if (node) nodes.current.set(rowValue, node)
              else nodes.current.delete(rowValue)
            }}
            value={rowValue}
          >
            {renderPanel(row, rowValue === value)}
          </TabsPrimitive.Content>
        )
      })}
    </div>
  )
}

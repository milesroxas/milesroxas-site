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
 * A swap in flight: `incoming` dissolving in over `outgoing`, and `target`
 * where it is headed (1 the new deck, 0 back to the old one).
 */
type Swap = { incoming: string; outgoing: string; target: 0 | 1 }

/** Closed while the new deck holds: unseen, and out of view to observers (the stack's deal). */
const HELD = 'inset(0 0 100% 0)'

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

const clearSwapStyles = (node: HTMLElement | undefined) => {
  if (!node) return
  node.style.clipPath = ''
  node.style.filter = ''
  node.style.opacity = ''
  node.style.zIndex = ''
}

/** Both decks' styles at progress `p`: the old one eased out by `outBy`, the new one in from `inFrom`. */
const dissolveStyles = (p: number, reduced: boolean) => {
  const { blur, inFrom, outBy } = DECK_SWAP_MOTION.dissolve
  const soften = reduced ? 0 : blur
  const out = clamp01(p / outBy)
  const into = clamp01((p - inFrom) / (1 - inFrom))
  const filter = (px: number) => (soften ? `blur(${(soften * px).toFixed(2)}px)` : '')
  return {
    outgoing: { filter: filter(out), opacity: ((1 - out) ** 2).toFixed(4) },
    incoming: {
      clipPath: p === 0 ? HELD : '',
      filter: filter(1 - into),
      opacity: (1 - (1 - into) ** 3).toFixed(4),
      zIndex: '1',
    },
  }
}

/**
 * Resolves once the deck's first picture can paint, or after `hold` ms: the
 * old deck stays up until then, so the dissolve lands on a picture, not a
 * plate. The deck's pictures turn eager first: a lazy image under the held
 * clip counts as out of view and would not start.
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
 * The decks, swapped by a dissolve: the old deck softens and goes early, the
 * new one comes out of the same softness more slowly, so the frame is never
 * empty and no edge cuts across the slides. The blur bridges the two decks
 * where they overlap, so the change reads as one deck becoming another
 * rather than a double exposure. Both decks share a grid cell (the frame
 * keeps their height equal, see `sharedDeckFrame`); the old one is held
 * mounted, inert, until it has gone.
 *
 * The new deck holds closed until its first picture is ready (`hold` at
 * most) while the index row says it is loading. Interruptible: picking the
 * old tab mid-swap runs the dissolve back; picking a third replaces the deck
 * coming in and the dissolve carries on. Reduced motion keeps the fade and
 * drops the blur.
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
    const styles = dissolveStyles(p, live.current.reduced)
    const outgoing = nodes.current.get(current.outgoing)
    const incoming = nodes.current.get(current.incoming)
    if (outgoing) Object.assign(outgoing.style, styles.outgoing)
    if (incoming) Object.assign(incoming.style, styles.incoming)
  }

  const settle = () => {
    const current = live.current.swap
    if (!current) return
    const next = progress.current.p >= 1 ? current.incoming : current.outgoing
    clearSwapStyles(nodes.current.get(current.incoming))
    clearSwapStyles(nodes.current.get(current.outgoing))
    progress.current.p = 0
    tween.current = null
    setShown(next)
    setSwap(null)
  }

  const drive = (target: 0 | 1) => {
    if (tween.current?.target === target && tween.current.tween.isActive()) return
    tween.current?.tween.kill()
    const { dissolve, fade } = DECK_SWAP_MOTION
    const distance = Math.abs(target - progress.current.p)
    if (distance === 0) {
      settle()
      return
    }
    tween.current = {
      target,
      tween: gsap.to(progress.current, {
        p: target,
        duration: (live.current.reduced ? fade : dissolve.duration) * distance,
        ease: 'none',
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

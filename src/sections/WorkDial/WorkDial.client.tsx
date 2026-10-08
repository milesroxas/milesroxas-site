'use client'

import Link from 'next/link'
import type React from 'react'
import { type CSSProperties, useEffect, useMemo, useRef, useState, ViewTransition } from 'react'
import { choreographWorkMorph, useWorkCardMorph, workMorphName } from '@/heros/WorkHero/morph'
import { useLenis } from '@/hooks/useLenis'
import { cursorTarget } from '@/providers/Cursor/variants'
import { moreWorkMotionStyle } from '@/sections/MoreWork/motion'
import { MoreWorkPlate } from '@/sections/MoreWork/Plate'
import type { MoreWorkItem } from '@/sections/MoreWork/query'
import { createPlateSignal } from '@/sections/MoreWork/signal'

/**
 * How a row falls off with distance from the centre line. Prominence falls
 * along bells, round at the top and steep on the flanks, so the centre row is
 * clearly the largest without a hard peak. Ink and blur are measured in rows,
 * so the first neighbour is already dim and soft at any window height; size
 * and the drum are measured in reach, the centre line (0) to the window's
 * edge (1).
 */
const DIAL = {
  /** Width of the size bell, in reach. */
  spread: 0.5,
  /** Width of the ink bell, in rows. */
  inkSpread: 0.85,
  /** Ink and size a row falls to away from the centre. */
  ink: 0.18,
  scale: 0.55,
  /**
   * Rows sit closer on screen than in the scroll: each row takes a long
   * stretch of scroll, so a flick does not skip past it, but the dial still
   * shows its neighbours.
   */
  pack: 0.95,
  /** Degrees a row at the edge has turned away, like a drum. */
  tilt: 18,
  /** The drum's half-turn in radians: rows near the centre spread apart, rows at the edge gather. */
  bulge: 1.05,
  /** Pixels of blur a row gathers as it leaves, and the width of its bell, in rows. */
  blur: 8,
  blurSpread: 1.2,
  /**
   * Phones show the rows as a plain list (globals.css), several at once, so
   * ink and blur fall off over a few rows rather than one. They scroll
   * natively and never settle: a settle started under iOS's own momentum
   * fights it.
   */
  phone: { inkSpread: 2.5, blurSpread: 3 },
  /** Where along the reach a row starts fading out, gone by the window's edge. */
  fadeFrom: 0.75,
  /** How long the page rests before it settles on the nearest row, and how long the settle takes. */
  settleAfter: 180,
  settle: 1.3,
  /**
   * The plate changes only for a row the reader stops on: one that has held
   * the centre line this long, ms, while the page moves slower than
   * `commitSpeed` rows a second. A fast scroll bows the plate instead of
   * flicking through every picture it passes.
   */
  commitAfter: 160,
  commitSpeed: 2.5,
  /** How long the page must be still, ms, before its speed reads as zero. */
  restAfter: 120,
  /**
   * The dial scrolls heavier than the rest of the site: a wheel notch moves
   * it less, and the page glides longer after it, so each turn lands with
   * weight. Lenis's own defaults are 1 and 0.1.
   */
  wheel: 0.55,
  lerp: 0.055,
} as const

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}
/** Where the page rests with row `index` on the centre line. */
const restingScroll = ({ listTop, row }: { listTop: number; row: number }, index: number) =>
  listTop + index * row
const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

type RowProps = {
  item: MoreWorkItem
  index: number
  plateRef: React.RefObject<HTMLDivElement | null>
  onOpen: (index: number) => void
  onFocusRow: (index: number) => void
  ref: (node: HTMLAnchorElement | null) => void
}

function DialRow({ item, index, plateRef, onOpen, onFocusRow, ref }: RowProps) {
  const { slug, title } = item
  const href = `/works/${slug}`
  const morph = useWorkCardMorph(slug, href, plateRef, () => onOpen(index), { travel: true })

  return (
    <li className="work-dial-row">
      <Link
        {...cursorTarget('view')}
        ref={ref}
        className="work-dial-link"
        data-dial-row
        href={href}
        onClick={morph.onClick}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) onFocusRow(index)
        }}
        transitionTypes={morph.transitionTypes}
      >
        <div
          className="work-dial-enter motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
          style={enterAt(320 + Math.min(index, 6) * 60)}
        >
          <h2 className="work-dial-title">{title}</h2>
        </div>
      </Link>
    </li>
  )
}

type WorkDialProps = {
  items: MoreWorkItem[]
  title: string
  lead?: string | null
}

/**
 * The works index as a dial: one picture fixed in the centre, the list
 * turning past it. The row on the centre line is the one shown; rows dim,
 * shrink and tilt away with distance from it, like a drum. The plate follows
 * the row the reader stops on, not every row the page passes, and bows with
 * the scroll's speed in between; a resting page settles on the nearest row.
 * Clicking a row or the picture opens the case study through the plate.
 */
export function WorkDial({ items, title, lead }: WorkDialProps) {
  const lenis = useLenis()
  /** The row the plate shows: the last one the reader stopped on. */
  const [active, setActive] = useState(0)
  const [opening, setOpening] = useState<number | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([])
  const flex = useMemo(createPlateSignal, [])
  const geometry = useRef({ listTop: 0, row: 1 })
  const openingRef = useRef(false)
  openingRef.current = opening !== null

  const shown = items[opening ?? active] ?? items[0]
  const count = String(items.length).padStart(2, '0')

  // Lenis reads `wheelMultiplier` only when it is created; its `virtualScroll`
  // hook may scale each delta instead.
  useEffect(() => {
    if (!lenis) return
    const { virtualScroll, lerp } = lenis.options
    lenis.options.lerp = DIAL.lerp
    lenis.options.virtualScroll = (data) => {
      if (data.event.type.includes('wheel')) {
        data.deltaX *= DIAL.wheel
        data.deltaY *= DIAL.wheel
      }
      return virtualScroll?.(data) ?? true
    }
    return () => {
      lenis.options.virtualScroll = virtualScroll
      lenis.options.lerp = lerp
    }
  }, [lenis])

  useEffect(() => {
    const list = listRef.current
    const frame = windowRef.current
    const line = focusRef.current
    if (!list || !frame || !line) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-dial-row]'))
    const last = Math.max(rows.length - 1, 0)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const phone = matchMedia('(width < 64rem)')
    // From the centre line to the window's edge, above and below: equal on
    // desktop, short above on phones where rows leave under the plate.
    const reach = { above: 1, below: 1 }
    let current = 0
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let commitTimer: ReturnType<typeof setTimeout> | undefined
    let restTimer: ReturnType<typeof setTimeout> | undefined
    let touching = false
    /** Rows a second, signed, and where and when the page last moved. */
    let speed = 0
    let lastPosition = 0
    let movedAt = 0

    const commit = () => {
      if (openingRef.current) return
      const moving = performance.now() - movedAt < DIAL.restAfter ? Math.abs(speed) : 0
      if (moving > DIAL.commitSpeed) {
        commitTimer = setTimeout(commit, 60)
        return
      }
      setActive(current)
    }

    const update = () => {
      const { listTop, row } = geometry.current
      const raw = (scrollY - listTop) / row
      const position = clamp(raw, 0, last)
      const { inkSpread, blurSpread } = phone.matches ? DIAL.phone : DIAL
      rows.forEach((el, i) => {
        const away = Math.abs(i - position)
        const offset = (i - position) * row
        const reachSide = offset < 0 ? reach.above : reach.below
        const distance = (offset * DIAL.pack) / reachSide
        const u = Math.abs(distance)
        const side = Math.sign(distance)
        const fall = 1 - Math.exp(-((u / DIAL.spread) ** 2))
        // On the drum, a row's height on screen follows the sine of its turn.
        const turned =
          Math.sin(Math.min(u, 1) * DIAL.bulge) / Math.sin(DIAL.bulge) + Math.max(u - 1, 0)
        const shift = side * turned * reachSide - offset
        const lit = Math.exp(-((away / inkSpread) ** 2))
        const ink = (DIAL.ink + (1 - DIAL.ink) * lit) * (1 - smoothstep(DIAL.fadeFrom, 1, u))
        el.style.setProperty('--dial-o', ink.toFixed(3))
        el.style.setProperty(
          '--dial-blur',
          `${(DIAL.blur * (1 - Math.exp(-((away / blurSpread) ** 2)))).toFixed(2)}px`,
        )
        el.style.setProperty('--dial-y', `${shift.toFixed(1)}px`)
        el.style.setProperty('--dial-scale', (1 - (1 - DIAL.scale) * fall).toFixed(4))
        el.style.setProperty('--dial-tilt', (-side * Math.min(u, 1) * DIAL.tilt).toFixed(2))
      })
      if (openingRef.current) return position
      const next = Math.round(position)
      if (next !== current) {
        current = next
        clearTimeout(commitTimer)
        commitTimer = setTimeout(commit, DIAL.commitAfter)
      }
      return position
    }

    const settle = () => {
      if (touching || reduced.matches || phone.matches || openingRef.current) return
      const raw = (scrollY - geometry.current.listTop) / geometry.current.row
      if (raw <= 0 || raw >= last) return
      const nearest = Math.round(raw)
      if (Math.abs(raw - nearest) < 0.01) return
      const top = restingScroll(geometry.current, nearest)
      if (lenis) lenis.scrollTo(top, { duration: DIAL.settle, easing: easeOutQuart })
      else scrollTo({ top, behavior: 'smooth' })
    }

    // A finger resting on the glass is still reading: settle once it lifts.
    const onTouchStart = () => {
      touching = true
      clearTimeout(settleTimer)
    }
    const onTouchEnd = () => {
      touching = false
      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, DIAL.settleAfter)
    }

    const onScroll = () => {
      const position = update()
      const now = performance.now()
      const dt = (now - movedAt) / 1000
      if (dt > 0) {
        // A scroll after a pause starts from rest; steady ones average over a few frames.
        const instant = dt < 0.1 ? (position - lastPosition) / dt : 0
        speed += (instant - speed) * 0.35
        movedAt = now
        lastPosition = position
      }
      if (!reduced.matches) flex.set(speed)
      clearTimeout(restTimer)
      restTimer = setTimeout(() => {
        speed = 0
        flex.set(0)
      }, DIAL.restAfter)
      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, DIAL.settleAfter)
    }

    const measure = () => {
      geometry.current = {
        listTop: list.getBoundingClientRect().top + scrollY,
        row: rows[0]?.offsetHeight || 1,
      }
      reach.above = Math.max(line.offsetTop - frame.offsetTop, 1)
      reach.below = Math.max(frame.offsetTop + frame.offsetHeight - line.offsetTop, 1)
      lastPosition = update()
    }

    measure()
    // A page that opens part way down shows its row at once.
    setActive(current)
    const resize = new ResizeObserver(measure)
    resize.observe(list)
    resize.observe(frame)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('touchstart', onTouchStart, { passive: true })
    addEventListener('touchend', onTouchEnd, { passive: true })
    addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      resize.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('touchstart', onTouchStart)
      removeEventListener('touchend', onTouchEnd)
      removeEventListener('touchcancel', onTouchEnd)
      clearTimeout(settleTimer)
      clearTimeout(commitTimer)
      clearTimeout(restTimer)
    }
  }, [lenis, flex])

  const focusRow = (index: number) => {
    const top = restingScroll(geometry.current, index)
    const immediate = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (lenis) lenis.scrollTo(top, { duration: DIAL.settle, easing: easeOutQuart, immediate })
    else scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' })
  }

  return (
    <div className="work-dial" style={moreWorkMotionStyle}>
      <header className="work-dial-header">
        <div className="work-dial-heading">
          <h1 className="flex items-start gap-2.5 text-heading-1" id="works-index-title">
            <span className="overflow-clip pb-[0.08em]">
              <span className="inline-block motion-safe:animate-hero-rise motion-reduce:animate-hero-fade">
                {title}
              </span>
            </span>
            <span
              aria-hidden
              className="pt-1 font-medium font-mono text-xs/none tabular-nums tracking-normal motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
              style={enterAt(160)}
            >
              {count}
            </span>
          </h1>
          {lead && (
            <p
              className="work-dial-lead motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
              style={enterAt(240)}
            >
              {lead}
            </p>
          )}
        </div>
      </header>

      <div aria-hidden className="work-dial-stage">
        <div ref={windowRef} className="work-dial-window" />
        <div ref={focusRef} className="work-dial-focus" />
        <div className="work-dial-frame">
          {/* Unclipped: the ripple bends the plate past its frame. The wipe clips it on the way in. */}
          <div
            className="size-full motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade"
            style={enterAt(120)}
          >
            {/* The rows are the keyboard's way in; the picture is a pointer shortcut to the one shown. */}
            <a
              {...cursorTarget('view')}
              className="block size-full motion-safe:animate-hero-settle"
              href={shown ? `/works/${shown.slug}` : '/works'}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                linksRef.current[opening ?? active]?.click()
              }}
              style={enterAt(120)}
              tabIndex={-1}
            >
              <ViewTransition
                default="none"
                name={opening !== null && shown ? workMorphName(shown.slug) : undefined}
                onShare={choreographWorkMorph}
                share="work-morph"
              >
                <MoreWorkPlate
                  always
                  className="aspect-auto size-full"
                  index={opening ?? active}
                  items={items}
                  look="ripple"
                  opening={opening !== null}
                  flex={flex}
                  ref={plateRef}
                  size="(min-width: 64rem) 42vw, 100vw"
                />
              </ViewTransition>
            </a>
          </div>
          <div
            className="work-dial-caption motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
            style={enterAt(720)}
          >
            <span className="truncate font-medium">{shown?.client}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {String((opening ?? active) + 1).padStart(2, '0')} / {count}
            </span>
          </div>
        </div>
      </div>

      <ol ref={listRef} aria-labelledby="works-index-title" className="work-dial-list">
        {items.map((item, index) => (
          <DialRow
            index={index}
            item={item}
            key={item.id}
            onFocusRow={focusRow}
            onOpen={setOpening}
            plateRef={plateRef}
            ref={(node) => {
              linksRef.current[index] = node
            }}
          />
        ))}
      </ol>
    </div>
  )
}

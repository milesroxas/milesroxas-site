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
import { createPlateScrub } from '@/sections/MoreWork/scrub'

/**
 * How a row falls off with distance from the centre line (0) to the window's
 * edge (1). Prominence falls along a bell, round at the top and steep on the
 * flanks, so the centre row is clearly the largest without a hard peak.
 */
const DIAL = {
  /** Width of the bell, in reach. */
  spread: 0.5,
  /** Ink and size a row falls to away from the centre. */
  ink: 0.2,
  scale: 0.55,
  /**
   * Rows sit closer on screen than in the scroll: each row takes a long
   * stretch of scroll, so a flick does not skip past it, but the dial still
   * shows its neighbours.
   */
  pack: 0.72,
  /** Degrees a row at the edge has turned away, like a drum. */
  tilt: 18,
  /** The drum's half-turn in radians: rows near the centre spread apart, rows at the edge gather. */
  bulge: 1.05,
  /** Pixels of blur a row gathers as it leaves, from `blurFrom` along the reach to the edge. */
  blur: 8,
  blurFrom: 0.45,
  /** Where along the reach a row starts fading out, gone by the window's edge. */
  fadeFrom: 0.8,
  /** CSS pixels the plate's frayed edge may spill past the frame. */
  bleed: 64,
  /** How long the page rests before it settles on the nearest row. */
  settleAfter: 180,
  settle: 0.9,
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
 * shrink and tilt away with distance from it, like a drum. Scroll position
 * scrubs the plate's dissolve between pictures, so the change tracks the
 * page and reverses with it, and a resting page settles on the nearest row.
 * Clicking a row or the picture opens the case study through the plate.
 */
export function WorkDial({ items, title, lead }: WorkDialProps) {
  const lenis = useLenis()
  const [active, setActive] = useState(0)
  const [opening, setOpening] = useState<number | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([])
  const scrub = useMemo(createPlateScrub, [])
  const geometry = useRef({ listTop: 0, row: 1 })
  const openingRef = useRef(false)
  openingRef.current = opening !== null

  const shown = items[opening ?? active] ?? items[0]
  const count = String(items.length).padStart(2, '0')

  useEffect(() => {
    const list = listRef.current
    const frame = windowRef.current
    const line = focusRef.current
    if (!list || !frame || !line) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-dial-row]'))
    const last = Math.max(rows.length - 1, 0)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    // From the centre line to the window's edge, above and below: equal on
    // desktop, short above on phones where rows leave under the plate.
    const reach = { above: 1, below: 1 }
    let current = 0
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let touching = false

    const update = () => {
      const { listTop, row } = geometry.current
      const raw = (scrollY - listTop) / row
      const position = clamp(raw, 0, last)
      rows.forEach((el, i) => {
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
        const ink = (1 - (1 - DIAL.ink) * fall) * (1 - smoothstep(DIAL.fadeFrom, 1, u))
        el.style.setProperty('--dial-o', ink.toFixed(3))
        el.style.setProperty(
          '--dial-blur',
          `${(DIAL.blur * smoothstep(DIAL.blurFrom, 1, u)).toFixed(2)}px`,
        )
        el.style.setProperty('--dial-y', `${shift.toFixed(1)}px`)
        el.style.setProperty('--dial-scale', (1 - (1 - DIAL.scale) * fall).toFixed(4))
        el.style.setProperty('--dial-tilt', (-side * Math.min(u, 1) * DIAL.tilt).toFixed(2))
      })
      if (openingRef.current) return
      scrub.set(position)
      const next = Math.round(position)
      if (next !== current) {
        current = next
        setActive(next)
      }
    }

    const settle = () => {
      if (touching || reduced.matches || openingRef.current) return
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
      update()
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
      update()
    }

    measure()
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
    }
  }, [lenis, scrub])

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
                  bleed={DIAL.bleed}
                  className="aspect-auto size-full"
                  index={opening ?? active}
                  items={items}
                  opening={opening !== null}
                  ref={plateRef}
                  scrub={scrub}
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

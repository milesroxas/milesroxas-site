'use client'

import Link from 'next/link'
import type React from 'react'
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
} from 'react'
import { MembersMark } from '@/features/members/MembersMark'
import { choreographWorkMorph, useWorkCardMorph, workMorphName } from '@/heros/WorkHero/morph'
import { useLenis } from '@/hooks/useLenis'
import { cursorTarget } from '@/providers/Cursor/variants'
import { moreWorkMotionStyle } from '@/sections/MoreWork/motion'
import { MoreWorkPlate } from '@/sections/MoreWork/Plate'
import type { MoreWorkItem } from '@/sections/MoreWork/query'
import { createPlateSignal } from '@/sections/MoreWork/signal'
import { WorkList } from './WorkList.client'

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
  /** Rows sit a little closer on screen than their own height, so the dial shows its neighbours. */
  pack: 0.95,
  /** Degrees a row at the edge has turned away, like a drum. */
  tilt: 18,
  /** The drum's half-turn in radians: rows near the centre spread apart, rows at the edge gather. */
  bulge: 1.05,
  /** Pixels of blur a row gathers as it leaves, and the width of its bell, in rows. */
  blur: 8,
  blurSpread: 1.2,
  /** Where along the reach a row starts fading out, gone by the window's edge. */
  fadeFrom: 0.75,
  /** How long a focused row's scroll to the centre line takes, seconds. */
  focus: 1,
  /** How long the page must be still, ms, before its speed reads as zero. */
  restAfter: 120,
  /**
   * How far into a work's stretch, in the way the page is going, the caption
   * and summary hand over to the next work: early, so they arrive while the
   * plate's wave is still rising. They then play out on their own ease (CSS).
   */
  handover: 0.25,
  /**
   * A page left between two works for `settleAfter` ms glides to the one the
   * caption shows, over `settleBase` s plus `settlePer` s per work of
   * distance. Any input stops it at once and hands the page back.
   */
  settleAfter: 2000,
  settleBase: 0.8,
  settlePer: 0.8,
} as const

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4
/** The page moves on screen while it settles: it eases in and out. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}
/**
 * `travel` is the scroll each work takes: a full screen. The text and the
 * plate's wave both follow it one to one; only a page left between two works
 * for a while glides to the nearest whole one (`DIAL.settleAfter`).
 */
type Geometry = { top: number; row: number; travel: number }
/** Where the page rests with row `index` on the centre line: the start of its stretch. */
const restingScroll = ({ top, travel }: Geometry, index: number) => top + index * travel
/**
 * The work the caption shows next. It hands over only in the way the page is
 * going (`way`: 1 down, -1 up, 0 at rest), `DIAL.handover` into a work's
 * stretch, so a page resting between two works never flips between them.
 */
const handOver = (shown: number, position: number, way: number) => {
  if (shown < 0) return Math.round(position)
  // ceil(position - handover) going down, mirrored to floor(position + handover) going up.
  return way * (position - shown) > DIAL.handover
    ? way * Math.ceil(way * position - DIAL.handover)
    : shown
}
const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

type RowProps = {
  item: MoreWorkItem
  index: number
  /** The row the plate shows; only it answers the pointer. */
  active: boolean
  plateRef: React.RefObject<HTMLDivElement | null>
  onOpen: (index: number) => void
  onFocusRow: (index: number) => void
  ref: (node: HTMLAnchorElement | null) => void
}

function DialRow({ item, index, active, plateRef, onOpen, onFocusRow, ref }: RowProps) {
  const { slug, title } = item
  const href = `/works/${slug}`
  const morph = useWorkCardMorph(slug, href, plateRef, () => onOpen(index), { travel: true })

  return (
    <li className="work-dial-row" style={{ '--dial-i': index } as CSSProperties}>
      <Link
        {...cursorTarget('view')}
        ref={ref}
        className="work-dial-link"
        data-active={active || undefined}
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

/** Below this the index is a list (`WorkList`); the dial is `lg:` in the markup. */
const DIAL_QUERY = '(min-width: 64rem)'

const subscribeDial = (onChange: () => void) => {
  const query = matchMedia(DIAL_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * The works index: the dial on wide screens, the list on phones and tablets.
 * The cached HTML carries both, each hidden by CSS at the other's sizes;
 * once hydrated only the one that fits stays mounted, so a phone never runs
 * the dial's scroll work or its plate.
 */
export function WorkDial(props: WorkDialProps) {
  const dial = useSyncExternalStore(
    subscribeDial,
    () => matchMedia(DIAL_QUERY).matches,
    () => null,
  )

  return (
    <>
      <div className="lg:hidden">{dial !== true && <WorkList {...props} />}</div>
      <div className="hidden lg:contents">{dial !== false && <Dial {...props} />}</div>
    </>
  )
}

/**
 * The works index as a dial: one picture fixed in the centre, the list
 * turning past it. The row on the centre line is the one shown; rows dim,
 * shrink and tilt away with distance from it, like a drum. Everything follows
 * the reader's scroll and nothing else: the plate's wave between two rows is
 * as far along as the page is between them, and the page rests wherever the
 * reader leaves it. Only Lenis smooths the scroll; the dial never takes it
 * over. Clicking a row or the picture opens the case study through the plate.
 */
function Dial({ items, title, lead }: WorkDialProps) {
  const lenis = useLenis()
  /** The work the caption and summary show; it hands over early (`DIAL.handover`). */
  const [active, setActive] = useState(0)
  const [opening, setOpening] = useState<number | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([])
  /** The page's speed, which the plate bows with, and its position, which drives the wave. */
  const [flex, scrub] = useMemo(() => [createPlateSignal(), createPlateSignal()], [])
  const geometry = useRef<Geometry>({ top: 0, row: 1, travel: 1 })
  const openingRef = useRef(false)
  openingRef.current = opening !== null

  const shown = items[opening ?? active] ?? items[0]
  /** Where an item sits on the drum against the shown one. */
  const positionOf = (index: number) =>
    index === (opening ?? active) ? 'shown' : index < (opening ?? active) ? 'past' : 'ahead'
  const count = String(items.length).padStart(2, '0')

  useEffect(() => {
    const list = listRef.current
    // The dial's own box: its top is where the works' scroll starts.
    const root = list?.parentElement
    const frame = windowRef.current
    const line = focusRef.current
    if (!root || !list || !frame || !line) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-dial-row]'))
    const last = Math.max(rows.length - 1, 0)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    // From the centre line to the window's edge, above and below.
    const reach = { above: 1, below: 1 }
    /** The row on the centre line, and where the drum stands: exactly where the scroll is. */
    let current = -1
    const drum = { at: 0 }
    let restTimer: ReturnType<typeof setTimeout> | undefined
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    /** The page is gliding to a work; a pointer or finger is down. */
    let settling = false
    let pressed = false
    /** Works a second, signed, and where and when the page last moved. */
    let speed = 0
    let lastPosition = 0
    let movedAt = 0

    /** Lays the rows on the drum: each is placed from the centre line, not the scroll. */
    const render = () => {
      const { row } = geometry.current
      const { inkSpread, blurSpread } = DIAL
      rows.forEach((el, i) => {
        const away = Math.abs(i - drum.at)
        const offset = (i - drum.at) * row
        const reachSide = offset < 0 ? reach.above : reach.below
        const distance = (offset * DIAL.pack) / reachSide
        const u = Math.abs(distance)
        const side = Math.sign(distance)
        const fall = 1 - Math.exp(-((u / DIAL.spread) ** 2))
        // On the drum, a row's height on screen follows the sine of its turn.
        const turned =
          Math.sin(Math.min(u, 1) * DIAL.bulge) / Math.sin(DIAL.bulge) + Math.max(u - 1, 0)
        const lit = Math.exp(-((away / inkSpread) ** 2))
        const ink = (DIAL.ink + (1 - DIAL.ink) * lit) * (1 - smoothstep(DIAL.fadeFrom, 1, u))
        el.style.setProperty('--dial-o', ink.toFixed(3))
        el.style.setProperty(
          '--dial-blur',
          `${(DIAL.blur * (1 - Math.exp(-((away / blurSpread) ** 2)))).toFixed(2)}px`,
        )
        el.style.setProperty('--dial-y', `${(side * turned * reachSide).toFixed(1)}px`)
        el.style.setProperty('--dial-scale', (1 - (1 - DIAL.scale) * fall).toFixed(4))
        el.style.setProperty('--dial-tilt', (-side * Math.min(u, 1) * DIAL.tilt).toFixed(2))
      })
    }

    /** Where the page is, in works: the plate's wave and the text both follow it. */
    const update = () => {
      const { top, travel } = geometry.current
      const position = clamp((scrollY - top) / travel, 0, last)
      if (openingRef.current) return position
      scrub.set(position)
      drum.at = position
      render()
      const next = handOver(current, position, Math.sign(position - lastPosition))
      if (next !== current) {
        current = next
        setActive(next)
      }
      return position
    }

    const measureSpeed = (position: number) => {
      const now = performance.now()
      const dt = (now - movedAt) / 1000
      if (dt <= 0) return
      // A scroll after a pause starts from rest; steady ones average over a few frames.
      const instant = dt < 0.1 ? (position - lastPosition) / dt : 0
      speed += (instant - speed) * 0.35
      movedAt = now
      lastPosition = position
    }

    const scheduleSettle = () => {
      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, DIAL.settleAfter)
    }

    const onScroll = () => {
      measureSpeed(update())
      // The plate bows with the page's speed in rows of scroll, as it did when a row took one.
      const { row, travel } = geometry.current
      if (!reduced.matches) flex.set((speed * travel) / row)
      clearTimeout(restTimer)
      restTimer = setTimeout(() => {
        speed = 0
        flex.set(0)
      }, DIAL.restAfter)
      if (!settling) scheduleSettle()
    }

    /** The reader is holding the page, reading in another tab or opening a work. */
    const held = () => pressed || document.hidden || reduced.matches || openingRef.current

    /** Where a page left between two works glides to: none once it is past the dial or there. */
    const settleTarget = () => {
      const { top, travel } = geometry.current
      const raw = (scrollY - top) / travel
      const distance = Math.abs(raw - current)
      if (raw <= 0 || raw >= last || distance * travel < 2) return null
      return { top: restingScroll(geometry.current, current), distance }
    }

    /** Glides a page left between two works to the one the caption shows. */
    const settle = () => {
      const target = held() ? null : settleTarget()
      if (!lenis || !target) return
      settling = true
      lenis.scrollTo(target.top, {
        duration: DIAL.settleBase + DIAL.settlePer * target.distance,
        easing: easeInOutCubic,
        onComplete: () => {
          settling = false
        },
      })
    }

    // The wheel takes over a glide by itself (Lenis retargets from where the
    // page is). Keys, the scrollbar and touch scroll natively, so the glide
    // stops first or it would fight them: stopping resets Lenis to the page.
    const onWheel = () => {
      clearTimeout(settleTimer)
      settling = false
    }
    const interrupt = () => {
      clearTimeout(settleTimer)
      if (!settling || !lenis) return
      settling = false
      lenis.stop()
      lenis.start()
    }
    const onPress = () => {
      pressed = true
      interrupt()
    }
    const onRelease = () => {
      pressed = false
      scheduleSettle()
    }

    const measure = () => {
      geometry.current = {
        top: root.getBoundingClientRect().top + scrollY,
        row: rows[0]?.offsetHeight || 1,
        // The list holds the screen: its height is the screen's.
        travel: list.offsetHeight || 1,
      }
      reach.above = Math.max(line.offsetTop - frame.offsetTop, 1)
      reach.below = Math.max(frame.offsetTop + frame.offsetHeight - line.offsetTop, 1)
      lastPosition = update()
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(root)
    resize.observe(frame)
    const listeners = [
      ['scroll', onScroll],
      ['wheel', onWheel],
      ['keydown', interrupt],
      ['touchstart', interrupt],
      ['pointerdown', onPress],
      ['pointerup', onRelease],
      ['pointercancel', onRelease],
    ] as const
    for (const [type, listener] of listeners) {
      addEventListener(type, listener, { passive: true, capture: true })
    }
    return () => {
      resize.disconnect()
      for (const [type, listener] of listeners) {
        removeEventListener(type, listener, { capture: true })
      }
      clearTimeout(restTimer)
      clearTimeout(settleTimer)
    }
  }, [flex, scrub, lenis])

  // Tabbing to a row brings it to the centre line, as focus would scroll it into view.
  const focusRow = (index: number) => {
    const top = restingScroll(geometry.current, index)
    const immediate = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (lenis) lenis.scrollTo(top, { duration: DIAL.focus, easing: easeOutQuart, immediate })
    else scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' })
  }

  return (
    <div
      className="work-dial"
      style={
        {
          ...moreWorkMotionStyle,
          '--dial-steps': Math.max(items.length - 1, 0),
        } as CSSProperties
      }
    >
      <header className="work-dial-header">
        <div className="work-dial-heading">
          {/* The count sits beside the heading, not in it: the h1 reads "Work", not "Work11". */}
          <div className="text-heading-1 flex items-start gap-2.5">
            <h1 className="overflow-clip pb-[0.08em]" id="works-index-title">
              <span className="motion-safe:animate-hero-rise motion-reduce:animate-hero-fade inline-block">
                {title}
              </span>
            </h1>
            <span
              aria-hidden
              className="text-xs/none motion-safe:animate-hero-in motion-reduce:animate-hero-fade pt-1 font-mono font-medium tracking-normal tabular-nums"
              style={enterAt(160)}
            >
              {count}
            </span>
          </div>
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
            className="motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade size-full"
            style={enterAt(120)}
          >
            {/* The rows are the keyboard's way in; the picture is a pointer shortcut to the one shown. */}
            <a
              {...cursorTarget('view')}
              className="motion-safe:animate-hero-settle block size-full"
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
                  opening={opening !== null}
                  flex={flex}
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
            {/* Every label stacked in one box, like the summaries, the shown one in ink. */}
            <div className="work-dial-label">
              {items.map((item, index) => (
                <span data-position={positionOf(index)} key={item.id}>
                  <span className="truncate font-medium">{item.client}</span>
                  {item.client && item.industry && (
                    <span aria-hidden className="work-dial-label-rule" />
                  )}
                  {item.industry && (
                    <span className="text-muted-foreground truncate">{item.industry}</span>
                  )}
                  {item.membersOnly && (
                    <>
                      <span aria-hidden className="work-dial-label-rule" />
                      <MembersMark />
                    </>
                  )}
                </span>
              ))}
            </div>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {String((opening ?? active) + 1).padStart(2, '0')} / {count}
            </span>
          </div>
          {/* Every summary stacked in one box, on the drum with its row: the
              shown one is in ink, the others wait turned away above or below,
              so a change turns the way the dial did. */}
          {items.some((item) => item.summary) && (
            <div
              className="work-dial-summary motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
              style={enterAt(800)}
            >
              {items.map((item, index) =>
                item.summary ? (
                  <p data-position={positionOf(index)} key={item.id}>
                    {item.summary}
                  </p>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>

      <ol ref={listRef} aria-labelledby="works-index-title" className="work-dial-list">
        {items.map((item, index) => (
          <DialRow
            active={index === (opening ?? active)}
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
      {/* The scroll the works take; the stage and the list hold the screen while it passes. */}
      <div aria-hidden className="work-dial-track" />
    </div>
  )
}

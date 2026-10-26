'use client'

import { type ReactNode, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import {
  readPrefersReducedMotion,
  usePrefersReducedMotion,
} from '@/hooks/use-prefers-reduced-motion'

/** `--ease-out-quint` in globals.css: most of the change lands in the first third. */
const EASE_OUT_QUINT = 'cubic-bezier(0.23, 1, 0.32, 1)'
/** `--ease-out-cubic`: a gentler settle across a large frame. */
const EASE_OUT_CUBIC = 'cubic-bezier(0.215, 0.61, 0.355, 1)'

/** How far a piece of copy rises as it fades in, matching the hero's `hero-in`. */
const TEXT_RISE = '0.5rem'

type Reveal = {
  /** Seconds; under the quint curve the copy reads as there within about a third of it. */
  textDuration: number
  /** Seconds between pieces entering together; a burst compresses to `MAX_CASCADE`. */
  stagger: number
  mediaDuration: number
}

/** `intro` is copy that carries the block; `underMedia` is copy beside a frame, so a touch quicker. */
const REVEALS = {
  intro: { textDuration: 0.7, stagger: 0.06, mediaDuration: 1.2 },
  underMedia: { textDuration: 0.6, stagger: 0.05, mediaDuration: 1.2 },
} as const satisfies Record<string, Reveal>

export type ScrollRevealVariant = keyof typeof REVEALS

/**
 * Click-driven panel swaps (`useRevealSwap`): opacity only. A switch fired
 * while browsing must read as a response, not a replay of the entrance.
 * GSAP eases: the swap runs on GSAP.
 */
export const SCROLL_REVEAL_SWAP = {
  textDuration: 0.2,
  textEase: 'power2.out',
  stagger: 0.03,
  mediaDuration: 0.22,
  mediaEase: 'power2.out',
} as const

/** Swap exits finish faster than the incoming half settles. */
export const SCROLL_REVEAL_EXIT_TIME_SCALE = 1.6

/** How far a piece must rise past the fold before it plays, as a fraction of the viewport. */
const ENTER_OFFSET = 0.1

/** How far above the viewport the gate's root extends, so a piece already scrolled past still fires. */
const GATE_REACH_PX = 100_000

/** Longest a burst of pieces entering together takes to cascade (s). */
const MAX_CASCADE = 0.4

/** The gate's root margin: from far above the viewport down to `enterOffset` above the fold. */
export function revealGateMargin(enterOffset: number) {
  // A -100% bottom margin collapses the root to a line nothing can intersect.
  const offset = Math.round(Math.min(Math.max(enterOffset, 0), 0.9) * 100)
  return `${GATE_REACH_PX}px 0px -${offset}% 0px`
}

/** Delay between pieces in a burst of `count`: the stagger, compressed to fit `MAX_CASCADE`. */
export function cascadeStagger(stagger: number, count: number) {
  return count > 1 ? Math.min(stagger, MAX_CASCADE / (count - 1)) : stagger
}

/**
 * When a piece starts: `step` after the last one, but never more than
 * `MAX_CASCADE` after it could, so a flick never queues copy on screen.
 */
export function nextBeatAt(earliest: number, cursorAt: number, step: number) {
  return Math.max(earliest, Math.min(cursorAt + step, earliest + MAX_CASCADE))
}

type GateListener = (entered: Element[]) => void

const sharedGates = new Map<
  string,
  { observer: IntersectionObserver; listeners: Map<Element, GateListener> }
>()

/**
 * One play-once IntersectionObserver per root margin, shared by every shell
 * on the page. Elements that enter together reach their listener as one
 * burst, so a shell can cascade them.
 */
function sharedGate(rootMargin: string) {
  let gate = sharedGates.get(rootMargin)
  if (!gate) {
    const listeners = new Map<Element, GateListener>()
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = new Map<GateListener, Element[]>()
        for (const entry of entries) {
          const listener = entry.isIntersecting ? listeners.get(entry.target) : undefined
          if (!listener) continue
          listeners.delete(entry.target)
          observer.unobserve(entry.target)
          entering.set(listener, [...(entering.get(listener) ?? []), entry.target])
        }
        for (const [listener, entered] of entering) listener(entered)
      },
      { rootMargin, threshold: 0 },
    )
    gate = { observer, listeners }
    sharedGates.set(rootMargin, gate)
  }
  const { observer, listeners } = gate
  return {
    observe(el: Element, listener: GateListener) {
      listeners.set(el, listener)
      observer.observe(el)
    },
    unobserve(el: Element) {
      if (listeners.delete(el)) observer.unobserve(el)
    },
  }
}

const pageEndWatchers = new Set<() => void>()
let pageEndFrame = 0

const checkPageEnd = () => {
  pageEndFrame = 0
  if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) return
  for (const watcher of pageEndWatchers) watcher()
}

const onPageScroll = () => {
  pageEndFrame ||= requestAnimationFrame(checkPageEnd)
}

/** Runs `watcher` once per scroll frame while the page is at its end; one listener for every shell. */
function watchPageEnd(watcher: () => void) {
  if (!pageEndWatchers.size) window.addEventListener('scroll', onPageScroll, { passive: true })
  pageEndWatchers.add(watcher)
  onPageScroll()
  return () => {
    pageEndWatchers.delete(watcher)
    if (pageEndWatchers.size) return
    window.removeEventListener('scroll', onPageScroll)
    cancelAnimationFrame(pageEndFrame)
    pageEndFrame = 0
  }
}

/** Whole units inside copy: they enter as one piece and are never broken up. */
const REVEAL_UNIT =
  'img, picture, video, canvas, iframe, svg, button, input, select, textarea, form, table, pre, figure, [role], [data-state]'

/**
 * A text target's pieces in document order: the blocks that hold its copy (a
 * paragraph, a heading, a list item) and whole units. A long rich-text body
 * enters a paragraph at a time, not as one wall. Nested `data-reveal` targets
 * are pieces of their own.
 */
function textPieces(root: HTMLElement) {
  const pieces: HTMLElement[] = []
  const walk = (el: HTMLElement) => {
    const style = getComputedStyle(el)
    // `display: contents` has no box of its own to fade: its children are the pieces.
    const boxless = style.display === 'contents'
    if ((!boxless && !el.getClientRects().length) || el.matches('.sr-only')) return
    const children = Array.from(el.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.hasAttribute('data-reveal'),
    )
    const looseText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    )
    const whole =
      !boxless &&
      (el.matches(REVEAL_UNIT) ||
        looseText ||
        !children.length ||
        // Side by side: its children enter together.
        (style.display.endsWith('flex') && style.flexDirection.startsWith('row')) ||
        children.some((child) => getComputedStyle(child).display.startsWith('inline')))
    if (whole) pieces.push(el)
    else for (const child of children) walk(child)
  }
  walk(root)
  return pieces
}

const precedes = (a: Element, b: Element) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1

/**
 * `text` fades up, `media` wipes open from the top. A `stage`
 * (`data-reveal="stage"`) draws itself (a chart, a diagram): the shell hides
 * it until its beat and marks it `data-reveal-state="playing"`, and its own
 * CSS plays the drawing.
 */
type BeatKind = 'text' | 'media' | 'stage'

type Beat = {
  el: HTMLElement
  kind: BeatKind
  group: string | undefined
  animation?: Animation
  done: boolean
  onDone?: () => void
}

const CORNERS = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const

/** A media frame's corners as an `inset()` `round` clause, so the wipe's edge is rounded like the frame. */
function frameRound(frame: HTMLElement) {
  for (const el of [frame, frame.querySelector('img, video')]) {
    if (!el) continue
    const style = getComputedStyle(el)
    const radii = CORNERS.map((corner) => style[`border${corner}Radius`].split(' '))
    if (radii.every((radius) => radius.some((value) => Number.parseFloat(value) === 0))) continue
    const x = radii.map(([h]) => h)
    const y = radii.map(([h, v = h]) => v)
    return ` round ${x.join(' ')} / ${y.join(' ')}`
  }
  return ''
}

function keyframes(beat: Beat): Keyframe[] | null {
  if (beat.kind === 'text') {
    return [
      { opacity: 0, transform: `translateY(${TEXT_RISE})` },
      { opacity: 1, transform: 'none' },
    ]
  }
  if (beat.kind === 'media') {
    const round = frameRound(beat.el)
    return [
      { clipPath: `inset(0% 0% 100% 0%${round})` },
      { clipPath: `inset(0% 0% 0% 0%${round})` },
    ]
  }
  // A stage plays its own drawing: the beat only holds its place on the cascade.
  return null
}

/**
 * Builds the entrance over `root`'s `data-reveal` targets and returns its
 * cleanup. Each piece waits transparent on one shared gate and plays once as
 * it rises past it; pieces entering together cascade in document order. The
 * browser drives each beat (`Element.animate`), so it costs the scroll frame
 * nothing.
 */
function playReveal(
  root: HTMLElement,
  reveal: Reveal,
  enterOffset: number,
  painted: boolean,
  onComplete: () => void,
) {
  const gate = sharedGate(revealGateMargin(enterOffset))
  const beats = new Map<Element, Beat>()
  const touched = new Set<HTMLElement>()
  const cursor = { at: -Number.POSITIVE_INFINITY, group: undefined as string | undefined }
  let alive = true
  let outstanding = 0

  const settle = () => {
    outstanding -= 1
    if (outstanding === 0) onComplete()
  }

  const rest = (beat: Beat) => {
    if (beat.done) return
    beat.done = true
    beat.animation?.cancel()
    beat.el.style.removeProperty('opacity')
    beat.el.dataset.revealState = 'done'
    beat.onDone?.()
    settle()
  }

  const play = (beat: Beat, step: number) => {
    // Already scrolled past: land it rather than queue visible beats behind it.
    if (beat.el.getBoundingClientRect().bottom <= 0) {
      rest(beat)
      return
    }
    const now = performance.now() / 1000
    const joins = beat.group !== undefined && beat.group === cursor.group
    const at = joins ? Math.max(now, cursor.at) : nextBeatAt(now, cursor.at, step)
    Object.assign(cursor, { at, group: beat.group })
    const duration = beat.kind === 'text' ? reveal.textDuration : reveal.mediaDuration
    beat.animation = beat.el.animate(keyframes(beat), {
      duration: duration * 1000,
      delay: (at - now) * 1000,
      easing: beat.kind === 'text' ? EASE_OUT_QUINT : EASE_OUT_CUBIC,
      fill: 'both',
    })
    beat.el.style.removeProperty('opacity')
    beat.el.dataset.revealState = 'playing'
    // A cancelled animation rejects: teardown lands beats itself.
    beat.animation.finished.then(
      () => rest(beat),
      () => {},
    )
  }

  const onGate: GateListener = (entered) => {
    if (!alive) return
    const burst = entered
      .sort(precedes)
      .map((el) => beats.get(el))
      .filter((beat): beat is Beat => Boolean(beat && !beat.done && !beat.animation))
    const step = cascadeStagger(reveal.stagger, burst.length)
    for (const beat of burst) play(beat, step)
  }

  // At the end of the page a low piece can never rise to the gate: release what is on screen.
  const stopEndWatch = watchPageEnd(() => {
    const onScreen = [...beats.values()]
      .filter((beat) => !beat.done && !beat.animation)
      .map((beat) => beat.el)
      .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
    for (const el of onScreen) gate.unobserve(el)
    if (onScreen.length) onGate(onScreen)
  })

  const inView = (el: HTMLElement) => {
    const { top, bottom } = el.getBoundingClientRect()
    return top < window.innerHeight && bottom > 0
  }

  const hold = (
    el: HTMLElement,
    kind: BeatKind,
    group: string | undefined,
    onDone?: () => void,
  ) => {
    touched.add(el)
    // What the server HTML already showed on screen stays: replaying it would blank copy just read.
    if (painted && kind !== 'stage' && inView(el)) {
      el.dataset.revealState = 'done'
      onDone?.()
      return
    }
    // Transparent, so waiting copy stays in the accessibility tree and find-in-page.
    el.style.setProperty('opacity', '0')
    outstanding += 1
    beats.set(el, { el, kind, group, done: false, onDone })
    gate.observe(el, onGate)
  }

  for (const el of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
    touched.add(el)
    const group = el.dataset.revealGroup
    if (el.dataset.reveal === 'media' || el.dataset.reveal === 'stage') {
      hold(el, el.dataset.reveal, group)
      continue
    }
    const pieces = textPieces(el)
    let pending = pieces.length
    const landed = () => {
      pending -= 1
      if (pending <= 0) el.dataset.revealState = 'done'
    }
    if (!pending) el.dataset.revealState = 'done'
    for (const piece of pieces) hold(piece, 'text', group, landed)
  }
  if (outstanding === 0) onComplete()

  return () => {
    alive = false
    stopEndWatch()
    for (const beat of beats.values()) {
      gate.unobserve(beat.el)
      beat.animation?.cancel()
    }
    for (const el of touched) {
      el.style.removeProperty('opacity')
      delete el.dataset.revealState
    }
  }
}

const subscribeNever = () => () => {}
const isClient = () => true
const isServer = () => false

type ScrollRevealProps = {
  /** `div` for blocks that render their own `<section>` root. */
  as?: 'section' | 'div'
  className?: string
  children: ReactNode
  variant?: ScrollRevealVariant
  /** Overrides `ENTER_OFFSET` for a shell whose copy must open later (a veil over its first stretch). */
  enterOffset?: number
  /** Bump to rebuild the entrance and replay it (demo replay buttons). */
  replayKey?: number
  /** Fires once every beat has landed, or at once under reduced motion. */
  onComplete?: () => void
}

/**
 * The site's scroll-entrance motion language, owned in one place. Copy in a
 * `data-reveal` target fades up a paragraph at a time as it rises past the
 * gate; `data-reveal="media"` frames wipe open from the top. A target sharing
 * a `data-reveal-group` with the one before it starts on the same beat. A
 * `data-reveal="stage"` target draws itself. Every beat plays once.
 * Server-rendered copy stays visible without JavaScript, and what it showed
 * before hydration stays at rest; reduced motion renders the final state.
 */
export function ScrollReveal({
  as: Tag = 'section',
  className,
  children,
  variant = 'intro',
  enterOffset = ENTER_OFFSET,
  replayKey = 0,
  onComplete,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const prefersReducedMotion = usePrefersReducedMotion()
  // Server snapshot while hydrating: the browser has already painted this HTML.
  const hydrating = !useSyncExternalStore(subscribeNever, isClient, isServer)
  const paintedRef = useRef(hydrating)

  // Layout effect: targets must be hidden before the hydrated tree paints.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root?.querySelector('[data-reveal]')) return
    // The hook reads `false` through hydration; the media query is the truth.
    if (prefersReducedMotion || readPrefersReducedMotion()) {
      onCompleteRef.current?.()
      return
    }
    // Marks a live shell for CSS that hides content until its beat (a diagram's steps).
    root.dataset.revealShell = ''
    const stop = playReveal(
      root,
      REVEALS[variant],
      enterOffset,
      paintedRef.current && replayKey === 0,
      () => onCompleteRef.current?.(),
    )
    return () => {
      stop()
      delete root.dataset.revealShell
    }
  }, [prefersReducedMotion, replayKey, variant, enterOffset])

  return (
    <Tag className={className} ref={rootRef}>
      {children}
    </Tag>
  )
}

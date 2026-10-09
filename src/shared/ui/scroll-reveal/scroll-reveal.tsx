'use client'

import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { type ReactNode, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(SplitText)

/**
 * Every tunable the reveal reads. Beats run on two tracks: text (each line of
 * a `data-reveal` target's copy and each unit in it) and media
 * (`data-reveal="media"`). Every beat is a top-down mask wipe, gated on its own
 * position and cascading after the last beat on its track; `mediaOffset`
 * delays one track after its gate.
 */
export type ScrollRevealTuning = {
  /** Text wipe duration (s). */
  textDuration?: number
  /** GSAP ease for text targets. */
  textEase?: string
  /**
   * Delay between consecutive beats on the same track (s). A target sharing a
   * `data-reveal-group` value with the target before it lands its first beat
   * with that target's last. A burst entering at once compresses to fit
   * `REVEAL_MAX_CASCADE`.
   */
  stagger?: number
  /** Media entrance duration (s). */
  mediaDuration?: number
  /** GSAP ease for media targets. */
  mediaEase?: string
  /**
   * Scale the media content settles down from during the wipe: the
   * `data-reveal="media"` container is a clipped window (its mask holds the
   * frame) while its first child zooms out to rest. 1 = no scale.
   *
   * The first child must own the window's full box (be in-flow with size, or
   * `absolute inset-0` against the container). The scale transform makes it
   * the containing block for absolutely-positioned descendants, so a zero-size
   * static wrapper (e.g. `<Media fill>`'s default div — pass
   * `htmlElement={null}` instead) collapses the media to nothing.
   */
  mediaScaleFrom?: number
  /**
   * Track delay after a beat's gate (s): negative = media leads (text waits
   * `-mediaOffset`), positive = media waits. Ignored when the shell has no
   * media targets. Leave it 0 for scroll-gated blocks, where geometry already
   * sequences the tracks; it earns its keep in a pin or a shared
   * `gateSelector`, where every beat enters at once.
   */
  mediaOffset?: number
  /**
   * How far a beat must rise past the fold before it plays, as a fraction of
   * the viewport height. Position, not visible fraction: see `observeRevealGate`.
   */
  enterOffset?: number
}

export type ScrollRevealProps = ScrollRevealTuning & {
  /** `div` for blocks that render their own `<section>` root. */
  as?: 'section' | 'div'
  className?: string
  children: ReactNode
  /** Bump to rebuild the entrance and replay it (demo replay buttons). */
  replayKey?: number
  /**
   * Which of the two site reveals this shell plays; explicit tuning props
   * still win over the variant's values.
   */
  variant?: ScrollRevealVariant
  /**
   * Selector for an in-flow element whose position gates every beat
   * together, for sticky or fixed shells that are on screen from the first
   * paint. Resolved document-wide.
   */
  gateSelector?: string
  /**
   * Fires once the entrance has settled (or immediately under reduced
   * motion). Use it to mount work that must not composite during the wipe
   * or scale — a WebGL canvas inside a `clip-path` / `scale` animation.
   */
  onComplete?: () => void
}

/**
 * The complete reveal for introduction / text-only blocks: copy carries the
 * moment, so lines get more air between them. Owned in full here,
 * independently of the under-media reveal — tuning one never moves the other.
 * Every block tagged `variant="intro"` reads exactly these values.
 */
export const SCROLL_REVEAL_INTRO = {
  textDuration: 0.9,
  textEase: 'power3.out',
  stagger: 0.12,
} as const satisfies ScrollRevealTuning

/**
 * The complete reveal for copy paired with media: its own text tuning and a
 * clean top-origin mask wipe — the frame opens downward and nothing else
 * moves (`mediaScaleFrom` 1: no zoom, no fade, no blur — all expensive to
 * composite on large media). Owned in full here, independently of the intro
 * reveal. Every block tagged `variant="underMedia"` reads exactly these values.
 *
 * `mediaOffset` is 0 on purpose — the layout already sequences these tracks,
 * and better than a fixed delay can. Each track gates on its own target, so a
 * media-over-copy stack wipes when the image arrives and wipes the copy in
 * when the copy arrives: a real scroll-linked beat, and the text entrance is
 * guaranteed to play on screen where it can be seen. A lead here would add a
 * fixed wait on top of that gate, so on a quick scroll the copy would start
 * animating after the reader had already reached it.
 *
 * Side by side, both gates fire at the same scroll position, so 0 is also what
 * makes a heading and the image it aligns with land on one beat. Bespoke
 * pinned shells that put every target on screen at once have no geometry to
 * sequence them and own an explicit offset instead.
 */
export const SCROLL_REVEAL_UNDER_MEDIA = {
  textDuration: 0.6,
  textEase: 'power3.out',
  stagger: 0.04,
  mediaDuration: 1.2,
  mediaEase: 'power2.out',
  mediaScaleFrom: 1,
  mediaOffset: 0,
} as const satisfies ScrollRevealTuning

/**
 * Shared viewport gate: each beat holds until it has risen this fraction of
 * the viewport past the fold, and plays once.
 */
export const SCROLL_REVEAL_TRIGGER_DEFAULTS = {
  enterOffset: 0.25,
} as const satisfies ScrollRevealTuning

/**
 * Click-driven panel swaps (dropdown industry / audience). Distinct from the
 * scroll entrance: opacity only, no mask wipe. The wipe is first-seen
 * language; a switch the user will fire while browsing must feel like a
 * response, not a replay of the section reveal. Durations stay under 250ms.
 */
export const SCROLL_REVEAL_SWAP = {
  textDuration: 0.2,
  textEase: 'power2.out',
  stagger: 0.03,
  mediaDuration: 0.22,
  mediaEase: 'power2.out',
} as const

/**
 * Click-driven swap exits (panel/tab swaps) finish faster than the incoming
 * half settles. Scroll exits don't animate at all — entrances are play-once.
 */
export const SCROLL_REVEAL_EXIT_TIME_SCALE = 1.6

/** How far above the viewport the gate's root extends (`observeRevealGate`). */
const REVEAL_GATE_REACH_PX = 100_000

/** Longest a burst of beats entering together takes to cascade (s). */
const REVEAL_MAX_CASCADE = 0.8

/** Points sampled from a GSAP ease into its CSS `linear()` twin. */
const EASE_SAMPLES = 24

/**
 * The gate's root margin: from far above the viewport down to `enterOffset`
 * above the fold. A gate already above the viewport has risen past the line
 * too, so a reload or anchor jump that lands mid-page still fires it.
 */
export function revealGateMargin(enterOffset: number) {
  // A -100% bottom margin collapses the root to a line nothing can intersect.
  const offset = Math.round(Math.min(Math.max(enterOffset, 0), 0.9) * 100)
  return `${REVEAL_GATE_REACH_PX}px 0px -${offset}% 0px`
}

/** Split a screen ahead, so the copy is in lines before it reaches the gate. */
const PREPARE_MARGIN = `${REVEAL_GATE_REACH_PX}px 0px 100% 0px`

/**
 * A GSAP ease as a CSS easing: the curve sampled into `linear()`, so a beat
 * the browser drives follows exactly the curve the swap plays through GSAP.
 */
export function revealEasing(ease: string): string {
  const curve = gsap.parseEase(ease)
  const stops = Array.from({ length: EASE_SAMPLES + 1 }, (_, i) =>
    Number(curve(i / EASE_SAMPLES).toFixed(4)),
  )
  return `linear(${stops.join(', ')})`
}

/** Penner twins of the eases the reveals use, for browsers without `linear()`. */
const EASE_FALLBACK: Record<string, string> = {
  'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'power2.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'power3.out': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'power4.out': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'expo.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
}

const easings = new Map<string, string>()
let supportsLinear: boolean | undefined

/** The CSS easing a beat animates with, resolved once per ease name. */
function beatEasing(ease: string): string {
  let easing = easings.get(ease)
  if (easing) return easing
  supportsLinear ??= CSS.supports('animation-timing-function', 'linear(0, 1)')
  easing = supportsLinear ? revealEasing(ease) : (EASE_FALLBACK[ease] ?? 'ease-out')
  easings.set(ease, easing)
  return easing
}

/** Delay between beats in a burst of `count`: the stagger, compressed to fit `REVEAL_MAX_CASCADE`. */
export function cascadeStagger(stagger: number, count: number) {
  return count > 1 ? Math.min(stagger, REVEAL_MAX_CASCADE / (count - 1)) : stagger
}

type GateListener = { onEnter: (targets: Element[]) => void }

type SharedGate = {
  observer: IntersectionObserver
  listeners: Map<Element, GateListener>
}

const sharedGates = new Map<string, SharedGate>()

/**
 * One play-once IntersectionObserver per root margin, shared by every shell
 * on the page: a work page holds dozens of shells, and the browser computes
 * every observer's intersections on every scroll frame. Targets that enter
 * together reach their listener as one burst, so a shell can cascade them.
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
        for (const [listener, targets] of entering) listener.onEnter(targets)
      },
      { rootMargin, threshold: 0 },
    )
    gate = { observer, listeners }
    sharedGates.set(rootMargin, gate)
  }
  const { observer, listeners } = gate
  return {
    observe(target: Element, listener: GateListener) {
      listeners.set(target, listener)
      observer.observe(target)
    },
    unobserve(target: Element) {
      if (listeners.delete(target)) observer.unobserve(target)
    },
  }
}

/**
 * Play-once viewport gate: fires when `gate`'s top edge has risen
 * `enterOffset` of the viewport height past the fold, then stops watching.
 * Position, not visible fraction: a block several screens tall never exposes
 * a useful ratio of itself.
 */
export function observeRevealGate(gate: Element, enterOffset: number, onEnter: () => void) {
  const shared = sharedGate(revealGateMargin(enterOffset))
  shared.observe(gate, { onEnter })
  return () => shared.unobserve(gate)
}

const pageEndWatchers = new Set<() => void>()
let pageEndFrame = 0

const checkPageEnd = () => {
  pageEndFrame = 0
  const doc = document.documentElement
  if (window.scrollY + window.innerHeight < doc.scrollHeight - 2) return
  for (const watcher of pageEndWatchers) watcher()
}

const onPageScroll = () => {
  pageEndFrame ||= requestAnimationFrame(checkPageEnd)
}

/**
 * Runs `watcher` once per scroll frame while the page is scrolled to its end:
 * one listener and one scroll-height read for every shell, not one each.
 */
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

/** The two block shapes; each variant is a complete, independently tuned reveal. */
const SCROLL_REVEAL_VARIANTS = {
  intro: SCROLL_REVEAL_INTRO,
  underMedia: SCROLL_REVEAL_UNDER_MEDIA,
} as const

export type ScrollRevealVariant = keyof typeof SCROLL_REVEAL_VARIANTS

/**
 * Resolution floor for shells that pass no variant: the intro reveal's text
 * language, media-track values referenced from the under-media reveal (a
 * variant-less shell with media targets still wipes like the site), tracks
 * aligned, shared gate. Values are imported, never restated.
 */
const BASE = {
  ...SCROLL_REVEAL_INTRO,
  mediaDuration: SCROLL_REVEAL_UNDER_MEDIA.mediaDuration,
  mediaEase: SCROLL_REVEAL_UNDER_MEDIA.mediaEase,
  mediaScaleFrom: SCROLL_REVEAL_UNDER_MEDIA.mediaScaleFrom,
  mediaOffset: 0,
  ...SCROLL_REVEAL_TRIGGER_DEFAULTS,
} as const satisfies Required<ScrollRevealTuning>

type ResolvedTuning = Required<ScrollRevealTuning>

/** Base ← variant reveal ← explicit props; an undefined prop never overrides. */
function resolveTuning(
  variant: ScrollRevealVariant | undefined,
  overrides: ScrollRevealTuning,
): ResolvedTuning {
  const resolved: ResolvedTuning = {
    ...BASE,
    ...(variant ? SCROLL_REVEAL_VARIANTS[variant] : undefined),
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) (resolved as Record<string, unknown>)[key] = value
  }
  return resolved
}

/** Whole units inside copy: they enter as one beat and are never split. */
const REVEAL_UNIT =
  'img, picture, video, canvas, iframe, svg, button, input, select, textarea, form, table, pre, figure, [role], [data-state]'

/**
 * A text target's content in document order: prose (inline-only copy, split
 * into lines) and units (media, controls, inline boxes, rows laid out side by
 * side). Nested `data-reveal` targets play their own beats. Computed styles
 * are read once per element across the walk.
 */
function revealPieces(root: HTMLElement) {
  const styles = new Map<Element, CSSStyleDeclaration>()
  const styleOf = (el: Element) => {
    let style = styles.get(el)
    if (!style) {
      style = getComputedStyle(el)
      styles.set(el, style)
    }
    return style
  }
  // Content a line split would break: controls, media, and anything not laid out inline.
  const breaksProse = (el: Element) => {
    if (el instanceof SVGElement) return false
    if (el.matches(REVEAL_UNIT)) return true
    const { display } = styleOf(el)
    return display !== 'inline' && display !== 'contents' && display !== 'none'
  }
  const prose: HTMLElement[] = []
  const units: HTMLElement[] = []
  const walk = (el: HTMLElement) => {
    if (!el.getClientRects().length || el.matches('.sr-only')) return
    const style = styleOf(el)
    const sideBySide = style.display.endsWith('flex') && style.flexDirection.startsWith('row')
    const inlineBox = style.display.startsWith('inline-')
    if (el.matches(REVEAL_UNIT) || sideBySide || inlineBox) {
      units.push(el)
      return
    }
    const hasText = Boolean(el.textContent?.trim())
    if (hasText && !Array.from(el.querySelectorAll('*')).some(breaksProse)) {
      prose.push(el)
      return
    }
    const looseText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    )
    const children = Array.from(el.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.hasAttribute('data-reveal'),
    )
    if (looseText || !children.length) {
      units.push(el)
      return
    }
    for (const child of children) walk(child)
  }
  walk(root)
  return { prose, units }
}

const precedes = (a: Element, b: Element) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1

type BeatKind = 'text' | 'media'

type Beat = {
  els: HTMLElement[]
  kind: BeatKind
  /** Index of the target among its track's targets, in document order. */
  target: number
  group: string | undefined
  /** First beat of a target grouped with the one before it: lands with that target's last beat. */
  joins: boolean
  state: 'waiting' | 'playing' | 'done'
  animations: Animation[]
  onDone?: () => void
}

/**
 * The wipe's hidden and open mask edges. Text opens past its line box, so
 * ascenders and descenders that overhang a tight line height never pop in
 * when the mask is cleared. Open equals no clip, so clearing the mask at rest
 * changes nothing on screen.
 */
const MASK = {
  text: { from: '-25% -5% 125% -5%', to: '-25% -5% -25% -5%' },
  media: { from: '0% 0% 100% 0%', to: '0% 0% 0% 0%' },
} as const

const CORNERS = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const

/**
 * A media frame's resting corners as an `inset()` `round` clause, so the
 * wipe's open edge is rounded like the frame it lands as. Read from the frame,
 * else from the image or video it wraps; empty when the corners are square.
 */
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

/** A beat's mask at `edge`, rounded like the media frame it opens. */
const mask = (el: HTMLElement, kind: BeatKind, edge: 'from' | 'to') =>
  `inset(${MASK[kind][edge]}${kind === 'media' ? frameRound(el) : ''})`

/** Inline properties a shell writes; each cleared when the shell is torn down. */
type InlineProp = 'visibility' | 'clip-path' | 'transform'

/**
 * Builds the entrance over `root`'s `data-reveal` targets and returns its
 * cleanup. Text targets are hidden until they near the viewport, then split:
 * each rendered line of their copy is a beat, as is each unit. Every beat
 * waits on its own gate (or `gateSelector`'s) and cascades `stagger` after the
 * last beat on its track. Lines are joined back once the target has landed.
 *
 * The browser drives each beat (`Element.animate`): no per-frame style writes
 * from script, so a wipe costs the scroll frame nothing beyond the mask, and
 * no inline-style churn for session recorders to serialize.
 */
function playReveal(
  root: HTMLElement,
  tuning: ResolvedTuning,
  gateSelector: string | undefined,
  onComplete: () => void,
) {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
  const isMedia = (el: HTMLElement) => el.dataset.reveal === 'media'
  const hasMedia = targets.some(isMedia)
  const trackDelay = {
    text: hasMedia ? Math.max(0, -tuning.mediaOffset) : 0,
    media: Math.max(0, tuning.mediaOffset),
  }
  const track = (beat: Beat) => (beat.kind === 'media' ? 'media' : 'text')
  const cursors = {
    text: { at: -Infinity, target: -1, group: undefined as string | undefined },
    media: { at: -Infinity, target: -1, group: undefined as string | undefined },
  }
  let alive = true
  /** Every inline write, by element, to undo on teardown. */
  const styled = new Map<HTMLElement, Set<InlineProp>>()
  const splits = new Set<SplitText>()
  const playing = new Set<Beat>()
  // A target counts once until it is split, then once per beat.
  let outstanding = targets.length
  const settle = () => {
    outstanding -= 1
    if (outstanding === 0) onComplete()
  }

  const write = (el: HTMLElement, prop: InlineProp, value: string) => {
    el.style.setProperty(prop, value)
    const props = styled.get(el) ?? new Set<InlineProp>()
    props.add(prop)
    styled.set(el, props)
  }

  /** The zooming content inside each media window, when the reveal zooms. */
  const mediaContents = (beat: Beat) =>
    beat.kind === 'media' && tuning.mediaScaleFrom !== 1
      ? beat.els.flatMap((el) =>
          el.firstElementChild instanceof HTMLElement ? [el.firstElementChild] : [],
        )
      : []

  const gate = gateSelector ? null : sharedGate(revealGateMargin(tuning.enterOffset))
  const byLead = new Map<Element, Beat>()

  const rest = (beat: Beat) => {
    if (beat.state === 'done') return
    beat.state = 'done'
    playing.delete(beat)
    const lead = beat.els[0] as HTMLElement
    byLead.delete(lead)
    gate?.unobserve(lead)
    for (const animation of beat.animations) animation.cancel()
    for (const el of beat.els) {
      el.style.removeProperty('clip-path')
      el.dataset.revealState = 'done'
    }
    for (const el of mediaContents(beat)) el.style.removeProperty('transform')
    beat.onDone?.()
    settle()
  }

  const open = (el: HTMLElement, kind: BeatKind, delay: number) =>
    el.animate([{ clipPath: mask(el, kind, 'from') }, { clipPath: mask(el, kind, 'to') }], {
      duration: (kind === 'media' ? tuning.mediaDuration : tuning.textDuration) * 1000,
      easing: beatEasing(kind === 'media' ? tuning.mediaEase : tuning.textEase),
      delay: delay * 1000,
      fill: 'both',
    })

  const zoom = (el: HTMLElement, delay: number) =>
    el.animate([{ transform: `scale(${tuning.mediaScaleFrom})` }, { transform: 'scale(1)' }], {
      duration: tuning.mediaDuration * 1000,
      easing: beatEasing(tuning.mediaEase),
      delay: delay * 1000,
      fill: 'both',
    })

  const play = (beat: Beat, step: number) => {
    // Already scrolled past: land it rather than queue visible beats behind it.
    if (beat.els.every((el) => el.getBoundingClientRect().bottom <= 0)) {
      rest(beat)
      return
    }
    const cursor = cursors[track(beat)]
    const now = performance.now() / 1000
    const earliest = now + trackDelay[track(beat)]
    const joins = beat.joins && cursor.target === beat.target - 1 && cursor.group === beat.group
    const at = Math.max(earliest, joins ? cursor.at : cursor.at + step)
    Object.assign(cursor, { at, target: beat.target, group: beat.group })
    beat.state = 'playing'
    playing.add(beat)
    const delay = at - now
    beat.animations = [
      ...beat.els.map((el) => open(el, beat.kind, delay)),
      ...mediaContents(beat).map((el) => zoom(el, delay)),
    ]
    // Content with an entrance of its own (a diagram drawing its edges) keys on this.
    for (const el of beat.els) el.dataset.revealState = 'playing'
    // A cancelled animation rejects: teardown and re-splits land beats themselves.
    Promise.all(beat.animations.map((animation) => animation.finished)).then(
      () => rest(beat),
      () => {},
    )
  }

  const release = (beats: Beat[]) => {
    const waiting = beats
      .filter((beat) => beat.state === 'waiting')
      .sort((a, b) => precedes(a.els[0] as HTMLElement, b.els[0] as HTMLElement))
    for (const kind of ['text', 'media'] as const) {
      const burst = waiting.filter((beat) => track(beat) === kind)
      const step = cascadeStagger(tuning.stagger, burst.length)
      for (const beat of burst) play(beat, step)
    }
  }

  const listener: GateListener = {
    onEnter: (leads) => {
      if (!alive) return
      const entering = leads.flatMap((lead) => {
        const beat = byLead.get(lead)
        if (!beat) return []
        byLead.delete(lead)
        return [beat]
      })
      if (entering.length) release(entering)
    },
  }

  const overrideGate = gateSelector ? document.querySelector(gateSelector) : null
  let gateOpen = false
  const queued: Beat[] = []
  const stopOverride = overrideGate
    ? observeRevealGate(overrideGate, tuning.enterOffset, () => {
        if (!alive) return
        gateOpen = true
        release(queued.splice(0))
      })
    : undefined

  // At the end of the page a low beat can never rise to the gate: release what is on screen.
  const stopEndWatch = watchPageEnd(() => {
    if (!byLead.size) return
    const onScreen = [...byLead].filter(
      ([lead]) => lead.getBoundingClientRect().top < window.innerHeight,
    )
    for (const [lead] of onScreen) {
      byLead.delete(lead)
      gate?.unobserve(lead)
    }
    if (onScreen.length) release(onScreen.map(([, beat]) => beat))
  })

  const watch = (beats: Beat[]) => {
    for (const beat of beats) {
      for (const el of beat.els) write(el, 'clip-path', `inset(${MASK[beat.kind].from})`)
      for (const el of mediaContents(beat))
        write(el, 'transform', `scale(${tuning.mediaScaleFrom})`)
    }
    if (overrideGate) {
      if (gateOpen) release(beats)
      else queued.push(...beats)
      return
    }
    for (const beat of beats) {
      const lead = beat.els[0] as HTMLElement
      byLead.set(lead, beat)
      gate?.observe(lead, listener)
    }
    onPageScroll()
  }

  const beat = (els: HTMLElement[], kind: BeatKind, target: number, group?: string): Beat => ({
    els,
    kind,
    target,
    group,
    joins: false,
    state: 'waiting',
    animations: [],
  })

  /** Splits a text target into line and unit beats and starts watching them. */
  const prepare = (el: HTMLElement, target: number) => {
    if (!alive) return
    const group = el.dataset.revealGroup
    el.style.removeProperty('visibility')
    const pieces = revealPieces(el)
    let beats: Beat[] = []
    let split: SplitText | undefined
    let remaining = 0
    const join = () =>
      queueMicrotask(() => {
        el.dataset.revealState = 'done'
        if (!split) return
        splits.delete(split)
        split.revert()
      })
    split = pieces.prose.length
      ? SplitText.create(pieces.prose, {
          type: 'lines',
          aria: 'none',
          autoSplit: true,
          // A re-split mid-entrance (resize, late font) lands the target at rest.
          onSplit: () => {
            for (const pending of beats) rest(pending)
          },
        })
      : undefined
    if (split) splits.add(split)
    const els = [...pieces.units, ...((split?.lines ?? []) as HTMLElement[])].sort(precedes)
    beats = els.map((line) => ({
      ...beat([line], 'text', target, group),
      onDone: () => {
        remaining -= 1
        if (remaining === 0) join()
      },
    }))
    if (beats[0]) beats[0].joins = Boolean(group)
    remaining = beats.length
    outstanding += beats.length
    settle()
    if (!beats.length) join()
    watch(beats)
  }

  const prepareGate = sharedGate(PREPARE_MARGIN)
  const textIndex = new Map<Element, number>()
  const preparer: GateListener = {
    onEnter: (els) => {
      if (!alive) return
      document.fonts.ready.then(() => {
        for (const el of els) prepare(el as HTMLElement, textIndex.get(el) ?? 0)
      })
    },
  }

  const indexes = { text: 0, media: 0 }
  for (const el of targets) {
    if (isMedia(el)) {
      watch([beat([el], 'media', indexes.media++)])
      outstanding += 1
      settle()
    } else {
      textIndex.set(el, indexes.text++)
      write(el, 'visibility', 'hidden')
      prepareGate.observe(el, preparer)
    }
  }

  /** Every inline write and state mark undone, so a rebuilt shell starts from the server state. */
  const undoWrites = () => {
    for (const [el, props] of styled) {
      for (const prop of props) el.style.removeProperty(prop)
      delete el.dataset.revealState
    }
  }

  return () => {
    alive = false
    stopEndWatch()
    stopOverride?.()
    for (const el of textIndex.keys()) prepareGate.unobserve(el)
    for (const lead of byLead.keys()) gate?.unobserve(lead)
    for (const beat of playing) {
      for (const animation of beat.animations) animation.cancel()
    }
    for (const split of splits) split.revert()
    undoWrites()
  }
}

/**
 * The site's scroll-entrance motion language, owned in one place. Nothing
 * moves: a mask opens each beat from the top. Copy in a `data-reveal` target
 * opens one rendered line at a time as each line reaches the gate; media,
 * controls and inline boxes in it open whole on the same cascade, and
 * `data-reveal="media"` frames open on their own track. A target sharing a
 * `data-reveal-group` with the one before it lands on that target's last
 * beat. Every beat plays once.
 * Server-rendered children stay visible without JavaScript; reduced motion
 * renders the final state.
 */
export function ScrollReveal({
  as: Tag = 'section',
  className,
  children,
  replayKey = 0,
  variant,
  gateSelector,
  onComplete,
  ...tuning
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    textDuration,
    textEase,
    stagger,
    mediaDuration,
    mediaEase,
    mediaScaleFrom,
    mediaOffset,
    enterOffset,
  } = resolveTuning(variant, tuning)

  // Layout effect: targets must be hidden before the hydrated tree paints.
  // biome-ignore lint/correctness/useExhaustiveDependencies(replayKey): a bump rebuilds the entrance
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root?.querySelector('[data-reveal]')) return
    if (prefersReducedMotion) {
      onCompleteRef.current?.()
      return
    }
    // Marks a live shell for CSS that hides content until its beat (a diagram's steps).
    root.dataset.revealShell = ''
    const stop = playReveal(
      root,
      {
        textDuration,
        textEase,
        stagger,
        mediaDuration,
        mediaEase,
        mediaScaleFrom,
        mediaOffset,
        enterOffset,
      },
      gateSelector,
      () => onCompleteRef.current?.(),
    )
    return () => {
      stop()
      delete root.dataset.revealShell
    }
  }, [
    prefersReducedMotion,
    replayKey,
    textDuration,
    textEase,
    stagger,
    mediaDuration,
    mediaEase,
    mediaScaleFrom,
    mediaOffset,
    enterOffset,
    gateSelector,
  ])

  return (
    <Tag className={className} ref={rootRef}>
      {children}
    </Tag>
  )
}

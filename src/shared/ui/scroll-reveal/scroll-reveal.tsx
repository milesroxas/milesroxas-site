'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(SplitText, useGSAP)

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
  /** Bump to rebuild the timeline and replay the entrance (demo replay buttons). */
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
   * or scale — a WebGL canvas inside a `clip-path` / `scale` tween.
   */
  onComplete?: () => void
}

/**
 * The complete reveal for introduction / text-only blocks: copy carries the
 * moment, so lines get more air between them. Owned in full here,
 * independently of the under-media reveal — tuning one never moves the other.
 * Tune on /demo/transitions ("Reveal — intro / text only"), paste back; every
 * block tagged `variant="intro"` reads exactly these values.
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
 * reveal. Tune on /demo/transitions ("Reveal — media + text"), paste back;
 * every block tagged `variant="underMedia"` reads exactly these values.
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
 * sequence them and own an explicit offset instead (INDUSTRY_WORK_MEDIA_OFFSET).
 */
export const SCROLL_REVEAL_UNDER_MEDIA = {
  textDuration: 0.6,
  textEase: 'power3.out',
  stagger: 0.04,
  mediaDuration: 0.8,
  mediaEase: 'power3.out',
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

/**
 * The gate's root margin: from far above the viewport down to `enterOffset`
 * above the fold. A gate already above the viewport has risen past the line
 * too, so a reload or anchor jump that lands mid-page still fires it.
 */
function revealGateMargin(enterOffset: number) {
  // A -100% bottom margin collapses the root to a line nothing can intersect.
  const offset = Math.round(Math.min(Math.max(enterOffset, 0), 0.9) * 100)
  return `${REVEAL_GATE_REACH_PX}px 0px -${offset}% 0px`
}

/**
 * Play-once viewport gate: fires when `gate`'s top edge has risen
 * `enterOffset` of the viewport height past the fold, then disconnects.
 * Position, not visible fraction: a block several screens tall never exposes
 * a useful ratio of itself.
 */
export function observeRevealGate(gate: Element, enterOffset: number, onEnter: () => void) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      onEnter()
      observer.disconnect()
    },
    { rootMargin: revealGateMargin(enterOffset), threshold: 0 },
  )
  observer.observe(gate)
  return () => observer.disconnect()
}

/** Delay between beats in a burst of `count`: the stagger, compressed to fit `REVEAL_MAX_CASCADE`. */
export function cascadeStagger(stagger: number, count: number) {
  return count > 1 ? Math.min(stagger, REVEAL_MAX_CASCADE / (count - 1)) : stagger
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

/** Base ← variant reveal ← explicit props; an undefined prop never overrides. */
function resolveTuning(
  variant: ScrollRevealVariant | undefined,
  overrides: ScrollRevealTuning,
): Required<ScrollRevealTuning> {
  const resolved: Required<ScrollRevealTuning> = {
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

/** Content a line split would break: controls, media, and anything not laid out inline. */
const breaksProse = (el: Element) => {
  if (el instanceof SVGElement) return false
  if (el.matches(REVEAL_UNIT)) return true
  const { display } = getComputedStyle(el)
  return display !== 'inline' && display !== 'contents' && display !== 'none'
}

type RevealPiece = { el: HTMLElement; prose: boolean }

/**
 * A text target's content in document order: prose (inline-only copy, split
 * into lines) and units (media, controls, inline boxes, rows laid out side by
 * side). Nested `data-reveal` targets play their own beats.
 */
function revealPieces(el: HTMLElement, out: RevealPiece[] = []): RevealPiece[] {
  if (!el.getClientRects().length || el.matches('.sr-only')) return out
  const style = getComputedStyle(el)
  const sideBySide = style.display.endsWith('flex') && style.flexDirection.startsWith('row')
  const inlineBox = style.display.startsWith('inline-')
  if (el.matches(REVEAL_UNIT) || sideBySide || inlineBox) {
    out.push({ el, prose: false })
    return out
  }
  const hasText = Boolean(el.textContent?.trim())
  if (hasText && !Array.from(el.querySelectorAll('*')).some(breaksProse)) {
    out.push({ el, prose: true })
    return out
  }
  const looseText = Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  )
  const children = Array.from(el.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && !child.hasAttribute('data-reveal'),
  )
  if (looseText || !children.length) {
    out.push({ el, prose: false })
    return out
  }
  for (const child of children) revealPieces(child, out)
  return out
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
  onDone?: () => void
}

type ResolvedTuning = Required<ScrollRevealTuning>

/**
 * The wipe's hidden and open masks. Text opens past its line box, so
 * ascenders and descenders that overhang a tight line height never pop in
 * when the mask is cleared.
 */
const MASK = {
  text: { from: 'inset(-25% -5% 125% -5%)', to: 'inset(-25% -5% -25% -5%)' },
  media: { from: 'inset(0% 0% 100% 0%)', to: 'inset(0% 0% 0% 0%)' },
} as const

/** Inline styles a beat owns, cleared at rest so the stylesheet wins again. */
const BEAT_PROPS = 'clipPath,willChange,transition'

// `transition: none`: a `pressable` target's CSS transition would smear every GSAP write.
const beatFrom = (kind: BeatKind): gsap.TweenVars => ({
  clipPath: MASK[kind].from,
  transition: 'none',
})

const beatTo = (kind: BeatKind, tuning: ResolvedTuning): gsap.TweenVars => ({
  clipPath: MASK[kind].to,
  duration: kind === 'media' ? tuning.mediaDuration : tuning.textDuration,
  ease: kind === 'media' ? tuning.mediaEase : tuning.textEase,
})

/** The zooming content inside each media window, when the reveal zooms. */
const mediaContents = (beat: Beat, tuning: ResolvedTuning) =>
  beat.kind === 'media' && tuning.mediaScaleFrom !== 1
    ? beat.els.flatMap((el) => (el.firstElementChild ? [el.firstElementChild] : []))
    : []

/**
 * Builds the entrance over `root`'s `data-reveal` targets and returns its
 * cleanup. Text targets are hidden until they near the viewport, then split:
 * each rendered line of their copy is a beat, as is each unit. Every beat
 * waits on its own gate (or `gateSelector`'s) and cascades `stagger` after the
 * last beat on its track. Lines are joined back once the target has landed.
 * `safe` runs late work inside the GSAP context so cleanup reverts it.
 */
function playReveal(
  root: HTMLElement,
  tuning: ResolvedTuning,
  gateSelector: string | undefined,
  safe: <T extends (...args: never[]) => void>(fn: T) => T,
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
  // A target counts once until it is split, then once per beat.
  let outstanding = targets.length
  const settle = () => {
    outstanding -= 1
    if (outstanding === 0) onComplete()
  }

  const rest = (beat: Beat) => {
    if (beat.state === 'done') return
    beat.state = 'done'
    byLead.delete(beat.els[0] as HTMLElement)
    gate?.unobserve(beat.els[0] as HTMLElement)
    gsap.killTweensOf(beat.els)
    gsap.set(beat.els, { clearProps: BEAT_PROPS })
    const contents = mediaContents(beat, tuning)
    if (contents.length) gsap.set(contents, { clearProps: 'transform' })
    beat.onDone?.()
    settle()
  }

  const play = (beat: Beat, step: number) => {
    // Already scrolled past: land it rather than queue visible beats behind it.
    if (beat.els.every((el) => el.getBoundingClientRect().bottom <= 0)) {
      rest(beat)
      return
    }
    const cursor = cursors[track(beat)]
    const now = gsap.ticker.time
    const earliest = now + trackDelay[track(beat)]
    const joins = beat.joins && cursor.target === beat.target - 1 && cursor.group === beat.group
    const at = Math.max(earliest, joins ? cursor.at : cursor.at + step)
    Object.assign(cursor, { at, target: beat.target, group: beat.group })
    beat.state = 'playing'
    const delay = at - now
    gsap.to(beat.els, {
      ...beatTo(beat.kind, tuning),
      delay,
      onStart: () => gsap.set(beat.els, { willChange: 'clip-path' }),
      onComplete: () => rest(beat),
    })
    const contents = mediaContents(beat, tuning)
    if (contents.length) {
      gsap.to(contents, {
        scale: 1,
        duration: tuning.mediaDuration,
        ease: tuning.mediaEase,
        delay,
      })
    }
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

  const byLead = new Map<Element, Beat>()
  const overrideGate = gateSelector ? document.querySelector(gateSelector) : null
  let gateOpen = false
  const queued: Beat[] = []
  const gate = overrideGate
    ? null
    : new IntersectionObserver(
        safe((entries: IntersectionObserverEntry[]) => {
          const entering = entries.flatMap((entry) => {
            const beat = entry.isIntersecting ? byLead.get(entry.target) : undefined
            if (!beat) return []
            byLead.delete(entry.target)
            gate?.unobserve(entry.target)
            return [beat]
          })
          if (entering.length) release(entering)
        }),
        { rootMargin: revealGateMargin(tuning.enterOffset), threshold: 0 },
      )
  const stopOverride = overrideGate
    ? observeRevealGate(
        overrideGate,
        tuning.enterOffset,
        safe(() => {
          gateOpen = true
          release(queued.splice(0))
        }),
      )
    : undefined

  // At the end of the page a low beat can never rise to the gate: release what is on screen.
  let endCheck = 0
  const releaseAtEnd = safe(() => {
    endCheck = 0
    if (!byLead.size) return
    const doc = document.documentElement
    if (window.scrollY + window.innerHeight < doc.scrollHeight - 2) return
    const onScreen = [...byLead].filter(
      ([lead]) => lead.getBoundingClientRect().top < window.innerHeight,
    )
    for (const [lead] of onScreen) {
      byLead.delete(lead)
      gate?.unobserve(lead)
    }
    if (onScreen.length) release(onScreen.map(([, beat]) => beat))
  })
  const onScroll = () => {
    endCheck ||= requestAnimationFrame(releaseAtEnd)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  const watch = (beats: Beat[]) => {
    for (const beat of beats) gsap.set(beat.els, beatFrom(beat.kind))
    for (const beat of beats) {
      const contents = mediaContents(beat, tuning)
      if (contents.length) gsap.set(contents, { scale: tuning.mediaScaleFrom })
    }
    if (overrideGate) {
      if (gateOpen) release(beats)
      else queued.push(...beats)
      return
    }
    for (const beat of beats) {
      const lead = beat.els[0] as HTMLElement
      byLead.set(lead, beat)
      gate?.observe(lead)
    }
    onScroll()
  }

  const beat = (els: HTMLElement[], kind: BeatKind, target: number, group?: string): Beat => ({
    els,
    kind,
    target,
    group,
    joins: false,
    state: 'waiting',
  })

  /** Splits a text target into line and unit beats and starts watching them. */
  const prepare = (el: HTMLElement, target: number) => {
    if (!alive) return
    const group = el.dataset.revealGroup
    gsap.set(el, { clearProps: 'visibility' })
    const pieces = revealPieces(el)
    const prose = pieces.filter((piece) => piece.prose).map((piece) => piece.el)
    let beats: Beat[] = []
    let split: SplitText | undefined
    let remaining = 0
    const join = () => queueMicrotask(() => split?.revert())
    split = prose.length
      ? SplitText.create(prose, {
          type: 'lines',
          aria: 'none',
          autoSplit: true,
          // A re-split mid-entrance (resize, late font) lands the target at rest.
          onSplit: () => {
            for (const pending of beats) rest(pending)
          },
        })
      : undefined
    const els = [
      ...pieces.filter((piece) => !piece.prose).map((piece) => piece.el),
      ...((split?.lines ?? []) as HTMLElement[]),
    ].sort(precedes)
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

  const prepareGate = new IntersectionObserver(
    safe((entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        prepareGate.unobserve(entry.target)
        const el = entry.target as HTMLElement
        const target = textIndex.get(el) ?? 0
        document.fonts.ready.then(safe(() => prepare(el, target)))
      }
    }),
    // Split a screen ahead, so the copy is in lines before it reaches the gate.
    { rootMargin: `${REVEAL_GATE_REACH_PX}px 0px 100% 0px`, threshold: 0 },
  )

  const indexes = { text: 0, media: 0 }
  const textIndex = new Map<Element, number>()
  for (const el of targets) {
    if (isMedia(el)) {
      watch([beat([el], 'media', indexes.media++)])
      outstanding += 1
      settle()
    } else {
      textIndex.set(el, indexes.text++)
      gsap.set(el, { visibility: 'hidden' })
      prepareGate.observe(el)
    }
  }

  return () => {
    alive = false
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(endCheck)
    gate?.disconnect()
    prepareGate.disconnect()
    stopOverride?.()
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
  const resolved = resolveTuning(variant, tuning)

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current
      if (!root?.querySelector('[data-reveal]')) return
      if (prefersReducedMotion || !contextSafe) {
        onCompleteRef.current?.()
        return
      }
      return playReveal(root, resolved, gateSelector, contextSafe, () => onCompleteRef.current?.())
    },
    {
      scope: rootRef,
      dependencies: [
        prefersReducedMotion,
        replayKey,
        resolved.textDuration,
        resolved.textEase,
        resolved.stagger,
        resolved.mediaDuration,
        resolved.mediaEase,
        resolved.mediaScaleFrom,
        resolved.mediaOffset,
        resolved.enterOffset,
        gateSelector,
      ],
      revertOnUpdate: true,
    },
  )

  return (
    <Tag className={className} ref={rootRef}>
      {children}
    </Tag>
  )
}

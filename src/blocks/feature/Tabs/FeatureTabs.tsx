'use client'

import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AimLayer } from '@/blocks/cta-link/AimLayer'
import { ctaMeta as meta } from '@/blocks/cta-link/Field'
import { INSTRUMENT_LOOK, RETICLE } from '@/blocks/cta-link/look'
import { BlockGrid } from '@/blocks/shared/grid'
import type { RowWithVisual } from '@/blocks/shared/row-visuals'
import { Section } from '@/blocks/shared/section'
import { TAB_SWAP_MOTION } from '@/blocks/shared/tab-swap'
import { typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { VideoMedia, warmVideo } from '@/components/Media/VideoMedia'
import RichText from '@/components/RichText'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { VideoPlayer } from '@/components/VideoPlayer'
import { loopSource } from '@/components/VideoPlayer/loop'
import { Visual } from '@/components/Visual'
import type { Visual as VisualData } from '@/features/immersive/visual/descriptor'
import { pixelFont } from '@/heros/InstrumentHero/pixelFont'
import {
  readPrefersReducedMotion,
  usePrefersReducedMotion,
} from '@/hooks/use-prefers-reduced-motion'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'
import { cloudflareImageLoader, isCloudflareImageUrl } from '@/utilities/cloudflareImageLoader'
import { getMediaUrl } from '@/utilities/getMediaURL'
import { streamPosterUrl } from '@/utilities/streamPoster'
import { cn } from '@/utilities/ui'
import { AIM_TUNING, PIXEL_PAINT } from './look'
import { type LiveLayer, type PaintSource, PixelPaint } from './PixelPaint'

/** A tab after the adapter resolved its visual slot; the story `source` never reaches the client. */
type FeatureTab = Omit<RowWithVisual<NonNullable<FeatureTabsBlockData['tabs']>[number]>, 'source'>

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or the work-page reveal band).
 */
type FeatureTabsProps = {
  bare?: boolean
  tabs: FeatureTab[]
  tabSize?: FeatureTabsBlockData['tabSize']
  textSize?: FeatureTabsBlockData['textSize']
  theme?: FeatureTabsBlockData['theme']
}

const MEDIA_SIZES = '(max-width: 1024px) 100vw, 62vw'
/** The paint's texture width: the panel's widest at 2× density. */
const PAINT_WIDTH = 2000

const readout =
  'text-fluoro font-[family-name:var(--font-geist-pixel-square)] text-[22px] leading-none tabular-nums'

const pad2 = (n: number) => String(n + 1).padStart(2, '0')

/** A Stream thumbnail at the paint's width, or a stored thumbnail. */
const posterOf = (thumbnail?: string | null, stored?: string | null) =>
  thumbnail ? streamPosterUrl(thumbnail, PAINT_WIDTH) : stored ? getMediaUrl(stored) : null

/** A Stream source can hand its frames to a canvas; a stored file's host may refuse CORS, so it never asks. */
const streamed = (resource: {
  cloudflareStreamPlaybackUrl?: string | null
  cloudflareStreamReady?: boolean | null
}) => Boolean(resource.cloudflareStreamPlaybackUrl && resource.cloudflareStreamReady)

/**
 * What a tab paints: a still, or a video (an upload or a full-length video's
 * loop) by its first frame. `null` for a Streak Field or an empty slot, which
 * cannot paint.
 */
const paintSource = (visual: VisualData | null): PaintSource | null => {
  if (visual?.kind === 'video') {
    const loop = loopSource(visual.video)
    return {
      kind: 'video',
      poster: posterOf(
        loop?.cloudflareStreamThumbnailUrl ?? visual.video.cloudflareStreamThumbnailUrl,
      ),
    }
  }
  if (visual?.kind !== 'media') return null
  const { media } = visual
  if (media.mimeType?.startsWith('video/')) {
    return {
      kind: 'video',
      poster: posterOf(media.cloudflareStreamThumbnailUrl, media.thumbnailURL),
    }
  }
  if (!media.mimeType?.startsWith('image/')) return null
  const src = media.cloudflareImageUrl || getMediaUrl(media.url, media.updatedAt)
  if (!src) return null
  return {
    kind: 'image',
    src: isCloudflareImageUrl(src) ? cloudflareImageLoader({ src, width: PAINT_WIDTH }) : src,
  }
}

/** The player a video tab hands off to, parked on its first frame until the paint lands. */
const LivePlayer = ({ visual }: { visual: VisualData }) => {
  if (visual.kind === 'video') {
    const loop = loopSource(visual.video)
    return (
      <VideoPlayer
        autoPlay={false}
        crossOrigin={loop && streamed(loop) ? 'anonymous' : undefined}
        fill
        video={visual.video}
      />
    )
  }
  if (visual.kind !== 'media') return null
  return (
    <VideoMedia
      autoPlay={false}
      crossOrigin={streamed(visual.media) ? 'anonymous' : undefined}
      fill
      resource={visual.media}
    />
  )
}

/** Keys per row below `lg`: one row up to four, then two rows. From `lg` every key shares one row. */
const keyColumns = (count: number) => (count <= 4 ? count : Math.ceil(count / 2))

/**
 * The new copy answers a switch the way the strip's swap always has: pieces
 * cascade in from the side of travel on the swap curve. First paint stays
 * still for the scroll entrance.
 */
const useCopyIn = (active: number) => {
  const ref = useRef<HTMLDivElement>(null)
  const previous = useRef(active)
  useLayoutEffect(() => {
    const from = previous.current
    previous.current = active
    if (from === active || !ref.current) return
    const reduced = readPrefersReducedMotion()
    const { copy, ease, fade } = TAB_SWAP_MOTION
    const travel = `calc(${copy.travel} * ${active > from ? 1 : -1})`
    const pieces = Array.from(ref.current.querySelectorAll<HTMLElement>('[data-tab-copy]'))
    const step = pieces.length > 1 ? Math.min(copy.stagger, copy.cascade / (pieces.length - 1)) : 0
    pieces.forEach((piece, index) => {
      piece.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, filter: `blur(${copy.blur}px)`, translate: `${travel} 0` },
              { opacity: 1, filter: 'blur(0px)', translate: '0 0' },
            ],
        {
          duration: reduced ? fade : copy.duration,
          delay: reduced ? 0 : index * step,
          easing: ease,
          fill: 'backwards',
        },
      )
    })
  }, [active])
  return ref
}

/**
 * The seam: a spot rule on the lit key's bottom edge, where the key meets the
 * display it switches. It travels to the chosen key on the swap's ink curve,
 * and lands without travel on first paint and on resize.
 */
const useSeam = (active: number) => {
  const listRef = useRef<HTMLDivElement>(null)
  const seamRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const list = listRef.current
    const seam = seamRef.current
    if (!list || !seam) return
    const place = (travel: boolean) => {
      const key = list.querySelectorAll<HTMLElement>('[role="tab"]')[active]
      if (!key) return
      seam.style.transition = travel
        ? `transform ${TAB_SWAP_MOTION.ink}ms ${TAB_SWAP_MOTION.ease}`
        : 'none'
      seam.style.width = `${key.offsetWidth}px`
      seam.style.transform = `translate(${key.offsetLeft}px, ${key.offsetTop + key.offsetHeight - 1}px)`
    }
    place(placed.current && !reduced)
    placed.current = true
    const observer = new ResizeObserver(() => place(false))
    observer.observe(list)
    return () => observer.disconnect()
  }, [active, reduced])

  return { listRef, seamRef }
}

/**
 * Feature tabs as a console: a rail of hardware keys over a display and an
 * ink panel. The lit key inverts and the spot seam under it travels the
 * rail. The panel runs the instrument field, and a switch paints the new
 * picture in through randomized pixel cells (`PixelPaint`, values in
 * `./look`) while the yellow readout counts the cells that have landed.
 *
 * From `lg` the keys run in one row across the block and the display (3/8)
 * sits beside the panel (5/8) under them. The display keeps its copy's
 * natural height, so a long description or list never scrolls inside the
 * block and the picture and the copy stay readable together (Rail, settled
 * in /proto/feature-tabs-many, 2026-11-26; the earlier layout locked the
 * copy column to the panel's 16:9 height, which left one line of display at
 * eight tabs). Narrower, the panel leads and the keys and copy stack under
 * it, the keys right below the picture they change. Below `md` the keys
 * become a list of rows under a pinned panel, and a row opens its copy in a
 * bottom sheet that steps to the neighbouring tabs.
 *
 * Stills and videos paint alike. A video tab paints its first frame and
 * hands off to its player as the paint lands, the player parked under the
 * canvas on that same frame (`PixelPaint`'s handoff), so the picture starts
 * moving without a cut. A video's player mounts once its key shows intent
 * (pointer, focus, press), so its opening frames load before the click and
 * never all at once. A set with a Streak Field or an empty slot, or a
 * browser without WebGL2, shows each tab's visual whole.
 */
export const FeatureTabs: React.FC<FeatureTabsProps> = ({
  bare,
  tabs,
  tabSize,
  textSize,
  theme,
}) => {
  const rows = tabs ?? []
  const [active, setActive] = useState(0)
  const [awake, setAwake] = useState(false)
  const [overPanel, setOverPanel] = useState(false)
  const [paintFailed, setPaintFailed] = useState(false)
  /** Video tabs whose player is mounted: the active one and every key that showed intent. */
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]))
  /** Bumped to reset a player left in its full video, so it comes back as the loop. */
  const [epochs, setEpochs] = useState<Record<number, number>>({})
  const wraps = useRef<(HTMLDivElement | null)[]>([])
  const keys = useRef<(HTMLButtonElement | null)[]>([])
  const readoutRef = useRef<HTMLSpanElement>(null)
  const copyRef = useCopyIn(active)
  /** Below `md` the copy opens in a bottom sheet from a list of rows instead of under the keys. */
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetCopyRef = useCopyIn(active)
  const { listRef, seamRef } = useSeam(active)
  const id = useId()
  const sources = useMemo(() => rows.map((row) => paintSource(row.visual)), [rows])

  const intend = (index: number) =>
    setMounted((current) => (current.has(index) ? current : new Set(current).add(index)))
  const live = useCallback((index: number): LiveLayer => {
    const wrap = wraps.current[index] ?? null
    return { wrap, video: wrap?.querySelector('video') ?? null }
  }, [])
  const onLeave = useCallback(
    (index: number) => {
      if (live(index).video?.controls)
        setEpochs((current) => ({ ...current, [index]: (current[index] ?? 0) + 1 }))
    },
    [live],
  )
  // A player mounted on intent starts fetching its opening frames at once.
  useEffect(() => {
    for (const index of mounted) {
      const { video } = live(index)
      if (video) warmVideo(video)
    }
  }, [mounted, live, epochs])

  // A sheet left open while the viewport grows past `md` would hide copy the page now shows inline.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 48rem)')
    const close = () => {
      if (wide.matches) setSheetOpen(false)
    }
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [])

  if (rows.length === 0) return null

  const n = rows.length
  const tab = rows[active] ?? rows[0]
  if (!tab) return null
  const type = typeScale(textSize)
  const columns = keyColumns(n)
  const lastSpan = columns * Math.ceil(n / columns) - n + 1
  const paints = !paintFailed && sources.every((source): source is PaintSource => Boolean(source))
  const alt =
    tab.visual?.kind === 'media'
      ? tab.visual.media.alt
      : tab.visual?.kind === 'video'
        ? tab.visual.video.title
        : null
  const { aim, panel, panelGap } = INSTRUMENT_LOOK

  const choose = (to: number) => {
    intend(to)
    setActive(to)
  }
  const openSheet = (to: number) => {
    choose(to)
    setSheetOpen(true)
  }
  const go = (to: number) => {
    keys.current[to]?.focus()
    choose(to)
  }
  const onKeyDown = (index: number) => (event: React.KeyboardEvent) => {
    const to =
      event.key === 'ArrowRight'
        ? (index + 1) % n
        : event.key === 'ArrowLeft'
          ? (index - 1 + n) % n
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? n - 1
              : null
    if (to === null) return
    event.preventDefault()
    go(to)
  }

  const sampleList = tab.items?.length ? (
    <div className="flex flex-col gap-3" key={`${tab.id ?? active}-list`}>
      {tab.subheading ? (
        <h4 className={meta} data-tab-copy>
          {tab.subheading}
        </h4>
      ) : null}
      <ol className="border-foreground/15 flex flex-col border-t text-sm">
        {tab.items.map((item, index) => (
          <li
            className="border-foreground/15 flex gap-4 border-b py-2.5"
            data-tab-copy
            key={item.id ?? index}
          >
            <span className={cn(meta, 'w-5 shrink-0 pt-px')}>{pad2(index)}</span>
            <span className="text-pretty">{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  ) : null

  const prev = rows[active - 1]
  const next = rows[active + 1]
  const stepClass =
    'flex min-h-14 touch-manipulation items-center gap-2 px-4 text-sm transition-[background-color,opacity] duration-150 ease-out select-none [-webkit-tap-highlight-color:transparent] active:bg-foreground/[0.06] disabled:opacity-30 motion-reduce:transition-none focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2'

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <div
          className="bg-background relative isolate"
          data-cursor-zone
          onPointerEnter={() => setAwake(true)}
          onPointerLeave={() => setAwake(false)}
        >
          <AimLayer
            config={{ ...RETICLE, ...aim, ...AIM_TUNING }}
            readouts={false}
            tone={overPanel ? 'spot' : 'invert'}
          />
          <BlockGrid className="gap-y-6">
            <div className="flex flex-col gap-3 md:col-span-8">
              <div className="border-foreground flex justify-end border-t pt-3" data-reveal>
                <span className={meta} data-aim="text">
                  {pad2(active)} / {pad2(n - 1)}
                </span>
              </div>
              <div
                aria-label="Feature tabs"
                className="border-foreground/20 relative grid grid-cols-(--keys) border-t border-l max-md:hidden lg:grid-cols-(--keys-lg)"
                data-reveal
                ref={listRef}
                role="tablist"
                style={
                  {
                    '--keys': `repeat(${columns}, minmax(0, 1fr))`,
                    '--keys-lg': `repeat(${n}, minmax(0, 1fr))`,
                  } as React.CSSProperties
                }
              >
                {rows.map((row, index) => {
                  const on = index === active
                  return (
                    <button
                      aria-controls={`${id}-panel`}
                      aria-selected={on}
                      className={cn(
                        'group border-foreground/20 relative flex touch-manipulation flex-col border-r border-b text-left select-none [-webkit-tap-highlight-color:transparent] max-lg:[grid-column:var(--last,auto)]',
                        'transition-[background-color,color] duration-300 ease-(--ease-out-quint) motion-reduce:transition-none',
                        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-4',
                        on ? 'bg-foreground text-background' : 'hover:bg-foreground/[0.06]',
                      )}
                      id={`${id}-tab-${index}`}
                      key={row.id ?? index}
                      onClick={() => choose(index)}
                      onFocus={() => intend(index)}
                      onKeyDown={onKeyDown(index)}
                      onPointerDown={() => intend(index)}
                      onPointerEnter={() => intend(index)}
                      ref={(el) => {
                        keys.current[index] = el
                      }}
                      role="tab"
                      style={
                        index === n - 1
                          ? ({ '--last': `span ${lastSpan}` } as React.CSSProperties)
                          : undefined
                      }
                      tabIndex={on ? 0 : -1}
                      type="button"
                    >
                      <span className="flex min-h-11 flex-1 items-center px-2.5 py-2.5 transition-[translate,scale] duration-150 ease-out group-active:translate-y-px group-active:scale-[0.97] motion-reduce:transition-none">
                        <span
                          className={cn(
                            'text-sm leading-tight font-light',
                            tabSize !== 'small' && '2xl:text-base',
                          )}
                        >
                          {row.title}
                        </span>
                      </span>
                    </button>
                  )
                })}
                <span
                  aria-hidden
                  className="bg-accent pointer-events-none absolute top-0 left-0 z-10 h-0.5"
                  ref={seamRef}
                />
              </div>

              {/* Phones: one row per tab, its lead line in view, under the pinned panel; a tap opens the copy in a sheet. */}
              <ol className="border-foreground/20 border-t md:hidden" data-reveal>
                {rows.map((row, index) => (
                  <li className="border-foreground/20 border-b" key={row.id ?? index}>
                    <button
                      aria-current={index === active || undefined}
                      aria-haspopup="dialog"
                      className="focus-visible:outline-ring active:bg-foreground/[0.06] aria-[current]:before:bg-accent relative flex min-h-14 w-full touch-manipulation items-center gap-3 py-3 pl-3 text-left transition-[background-color] duration-150 ease-out select-none [-webkit-tap-highlight-color:transparent] before:absolute before:inset-y-3 before:left-0 before:w-0.5 focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none"
                      onClick={() => openSheet(index)}
                      onPointerDown={() => intend(index)}
                      type="button"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-base leading-tight font-light">{row.title}</span>
                        <span className="text-muted-foreground line-clamp-2 text-sm text-pretty">
                          {row.heading}
                        </span>
                      </span>
                      <ChevronRight aria-hidden className="text-muted-foreground size-4 shrink-0" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div
              aria-labelledby={`${id}-tab-${active}`}
              className="flex flex-col gap-4 max-md:hidden md:col-span-8 lg:col-span-3"
              data-reveal
              id={`${id}-panel`}
              ref={copyRef}
              role="tabpanel"
            >
              {/* The display: the lit key's copy at its natural height. */}
              <div
                className="border-foreground/20 flex flex-col gap-3 border p-3"
                key={tab.id ?? active}
              >
                <h3 className={cn(type.heading, 'font-light text-balance')} data-tab-copy>
                  {tab.heading}
                </h3>
                {tab.description ? (
                  <div className="text-muted-foreground text-pretty" data-tab-copy>
                    <RichText
                      className={type.body}
                      data={tab.description}
                      enableGutter={false}
                      enableProse={false}
                    />
                  </div>
                ) : null}
                {alt ? <p className="sr-only">{alt}</p> : null}
              </div>

              {sampleList}
            </div>

            <div
              className="max-md:before:bg-background relative aspect-video self-start max-lg:order-first max-md:sticky max-md:top-(--chrome-top) max-md:z-10 max-md:before:absolute max-md:before:inset-x-0 max-md:before:bottom-full max-md:before:h-(--chrome-top) md:col-span-8 lg:col-span-5"
              data-reveal="media"
              onPointerEnter={() => setOverPanel(true)}
              onPointerLeave={() => setOverPanel(false)}
            >
              <div
                className={`${pixelFont.variable} bg-background text-foreground ring-foreground/15 absolute inset-0 isolate overflow-clip ring-1`}
                data-theme="dark"
              >
                <AimLayer
                  config={{
                    ...RETICLE,
                    ...AIM_TUNING,
                    tone: awake ? panel.wakeTone : panel.restTone,
                    cell: panel.cell,
                    speed: panel.speed,
                    shape: panel.shape,
                    aimLock: false,
                    crosshair: false,
                  }}
                  reticle={false}
                />
                {paints ? (
                  <>
                    {rows.map((row, index) =>
                      row.visual && sources[index]?.kind === 'video' && mounted.has(index) ? (
                        <div
                          aria-hidden={index !== active || undefined}
                          className="pointer-events-none absolute inset-0 opacity-0"
                          inert={index !== active || undefined}
                          key={`${row.id ?? index}-${epochs[index] ?? 0}`}
                          ref={(el) => {
                            wraps.current[index] = el
                          }}
                        >
                          <LivePlayer visual={row.visual} />
                        </div>
                      ) : null,
                    )}
                    <PixelPaint
                      active={active}
                      dials={PIXEL_PAINT}
                      live={live}
                      onLeave={onLeave}
                      onUnsupported={() => setPaintFailed(true)}
                      readout={readoutRef}
                      sources={sources as PaintSource[]}
                    />
                  </>
                ) : tab.visual ? (
                  <div className="absolute inset-0" key={tab.id ?? active}>
                    <Visual
                      fill
                      htmlElement={null}
                      imgClassName="object-cover"
                      placement="block"
                      size={MEDIA_SIZES}
                      visual={tab.visual}
                    />
                  </div>
                ) : null}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3.5 top-3 z-20 flex items-start justify-between gap-4"
                >
                  <span className={cn(meta, 'truncate')}>
                    {pad2(active)} / {tab.title}
                  </span>
                  {paints ? (
                    <span className={cn(readout, 'opacity-0')} ref={readoutRef}>
                      000/100
                    </span>
                  ) : null}
                </div>
                <div className="pointer-events-none absolute inset-x-3.5 bottom-3 z-20 flex items-end justify-between gap-4">
                  {tab.caption ? (
                    <p
                      className="bg-background/85 text-foreground hidden max-w-72 p-3 text-sm text-pretty md:block"
                      key={tab.id ?? active}
                    >
                      {tab.caption}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span aria-hidden className={meta}>
                    x / y <span data-aim-out="cell">000·000</span>
                  </span>
                </div>
              </div>
              <div aria-hidden className="absolute" data-aim="media" style={{ inset: -panelGap }} />
            </div>
          </BlockGrid>
        </div>
      </Container>

      <Drawer onOpenChange={setSheetOpen} open={sheetOpen}>
        <DrawerContent aria-describedby={undefined} className="max-h-[85dvh] md:hidden">
          <div
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-4 pb-6"
            ref={sheetCopyRef}
          >
            <div className="flex flex-col gap-3" key={tab.id ?? active}>
              <span className={meta} data-tab-copy>
                {pad2(active)} / {tab.title}
              </span>
              <DrawerTitle asChild className={cn(type.heading, 'font-light text-balance')}>
                <h3 data-tab-copy>{tab.heading}</h3>
              </DrawerTitle>
              {tab.description ? (
                <div className="text-muted-foreground text-pretty" data-tab-copy>
                  <RichText
                    className={type.body}
                    data={tab.description}
                    enableGutter={false}
                    enableProse={false}
                  />
                </div>
              ) : null}
            </div>
            {sampleList}
            {tab.caption ? (
              <p className="text-muted-foreground text-sm" data-tab-copy>
                {tab.caption}
              </p>
            ) : null}
          </div>
          <nav
            aria-label="Step through tabs"
            className="border-foreground/15 grid grid-cols-2 border-t pb-[env(safe-area-inset-bottom,0px)]"
          >
            <button
              className={stepClass}
              disabled={!prev}
              onClick={() => choose(active - 1)}
              type="button"
            >
              <ArrowLeft aria-hidden className="size-4 shrink-0" />
              <span className="truncate">{prev ? prev.title : 'Previous'}</span>
            </button>
            <button
              className={cn(stepClass, 'border-foreground/15 justify-end border-l')}
              disabled={!next}
              onClick={() => choose(active + 1)}
              type="button"
            >
              <span className="truncate">{next ? next.title : 'Next'}</span>
              <ArrowRight aria-hidden className="size-4 shrink-0" />
            </button>
          </nav>
        </DrawerContent>
      </Drawer>
    </Section>
  )
}

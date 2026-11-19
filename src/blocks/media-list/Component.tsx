'use client'

import type React from 'react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { ordinalLabel } from '@/blocks/shared/numbering'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName, typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { warmVideo } from '@/components/Media/VideoMedia'
import { AimReticle } from '@/features/aim-field/AimReticle'
import type { MediaListBlock as MediaListBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { createLayerStack, type Flow, MEDIA_LIST_MOTION, markerIn, markerOut } from './motion'

type Row = NonNullable<MediaListBlockData['items']>[number]
type Item = Row & { media: Exclude<Row['media'], number> }

type MediaListBlockProps = Pick<
  MediaListBlockData,
  | 'blockType'
  | 'description'
  | 'eyebrow'
  | 'heading'
  | 'id'
  | 'imagePosition'
  | 'items'
  | 'showNumbers'
  | 'textSize'
  | 'theme'
> & { bare?: boolean }

/** Short, short, long: the long dash sits on the side the reader is heading. */
const dashes = (flow: Flow) =>
  (flow === 'down' ? ['h-1.75', 'h-1.75', 'h-3.5'] : ['h-3.5', 'h-1.75', 'h-1.75']).map(
    (height, i) => ({ height, key: ['top', 'middle', 'bottom'][i] }),
  )

/**
 * The frame's playback and swaps: the active item's video plays while the
 * frame is on screen and restarts when its item is chosen; the others pause
 * once the wipe that covers them lands.
 */
function useMediaSwap(count: number) {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const [stack] = useState(() => createLayerStack(count))
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const frame = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  const pauseTimer = useRef<number>(undefined)

  const select = useCallback(
    (next: number) => {
      const current = activeRef.current
      if (next === current || next < 0 || next >= count) return
      const mode = stack.swap(layers.current, current, next)
      activeRef.current = next
      setActive(next)
      const video = videos.current[next]
      if (video) {
        if (mode === 'restart') video.currentTime = 0
        if (visible.current) video.play().catch(() => {})
      }
      window.clearTimeout(pauseTimer.current)
      pauseTimer.current = window.setTimeout(() => {
        videos.current.forEach((other, i) => {
          if (i !== activeRef.current) other?.pause()
        })
      }, MEDIA_LIST_MOTION.swap)
    },
    [count, stack],
  )

  const warm = useCallback((i: number) => {
    const video = videos.current[i]
    if (video) warmVideo(video)
  }, [])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting)
        const video = videos.current[activeRef.current]
        if (!video) return
        if (visible.current) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(pauseTimer.current)
    }
  }, [])

  return { active, frame, layers, select, stack, videos, warm }
}

/**
 * Spot-orange dash markers on the list's track, one per row and fixed to its
 * middle. The active row's marker flickers on from the side the reader came
 * from (./motion), and its long dash leads the way they moved.
 */
function useMarkers(active: number, count: number) {
  const markers = useRef<(HTMLSpanElement | null)[]>([])
  const playing = useRef<Animation[]>([])
  const shown = useRef(active)
  // Each row keeps the flow it was reached by, so a fading marker never flips its shape.
  const [flows, setFlows] = useState<Flow[]>(() => Array(count).fill('down'))
  const [reached, setReached] = useState(active)
  if (reached !== active) {
    const flow: Flow = active > reached ? 'down' : 'up'
    setReached(active)
    setFlows((current) => current.map((f, i) => (i === active ? flow : f)))
  }

  useLayoutEffect(() => {
    const previous = shown.current
    shown.current = active
    if (previous === active) return
    for (const animation of playing.current) animation.cancel()
    const incoming = markers.current[active]
    const outgoing = markers.current[previous]
    playing.current = [
      ...(outgoing ? markerOut(outgoing) : []),
      ...(incoming ? markerIn(incoming, active > previous ? 'down' : 'up') : []),
    ]
  }, [active])

  return { flows, markers }
}

/**
 * Media list on the composition grid, laid out as Split narrow: the frame
 * spans 5 then 6 columns, the copy column 3 then 2, mirrored by
 * `imagePosition`, stacked (frame first) below `md`.
 *
 * The list is a vertical tablist. A mouse commits after resting on a row
 * (`MEDIA_LIST_MOTION.dwell`); a click, tap or arrow key commits at once.
 * Rows off the active one dim; the row under the pointer lifts and shows a
 * grey marker of where it sits relative to the active one. The aim reticle
 * runs over the block on fine pointers (`AimReticle`).
 */
export const MediaListBlock: React.FC<MediaListBlockProps> = ({ items, ...props }) => {
  const rows = (items ?? []).filter(
    (item): item is Item => typeof item.media === 'object' && item.media !== null,
  )
  if (rows.length === 0) return null
  // The layer stack is sized once; a live-preview edit that adds or drops a row starts fresh.
  return <MediaList items={rows} key={rows.length} {...props} />
}

function MediaList({
  bare,
  description,
  eyebrow,
  heading,
  imagePosition,
  items,
  showNumbers,
  textSize,
  theme,
}: Omit<MediaListBlockProps, 'items'> & { items: Item[] }) {
  const swap = useMediaSwap(items.length)
  const { active, select, warm } = swap
  const { flows, markers } = useMarkers(active, items.length)
  const [hover, setHover] = useState<number | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const dwell = useRef<number>(undefined)
  const id = useId()
  useEffect(() => () => window.clearTimeout(dwell.current), [])

  const type = typeScale(textSize)
  const large = textSize === 'large'
  const numbered = showNumbers !== false
  const imageLeft = imagePosition !== 'right'

  const onKeyDown = (i: number) => (e: React.KeyboardEvent) => {
    const n = items.length
    const keys: Record<string, number> = {
      ArrowDown: (i + 1) % n,
      ArrowUp: (i - 1 + n) % n,
      Home: 0,
      End: n - 1,
    }
    const to = keys[e.key]
    if (to === undefined) return
    e.preventDefault()
    tabs.current[to]?.focus()
    select(to)
  }

  return (
    <div ref={host}>
      <AimReticle host={host} />
      <Section bare={bare} spacing="loose" theme={theme}>
        <Container>
          <BlockGrid>
            <div
              aria-labelledby={`${id}-tab-${active}`}
              className={cn(
                'bg-muted relative isolate aspect-5/4 w-full self-start overflow-hidden rounded-lg',
                'md:col-span-5 md:row-start-1 lg:col-span-6',
                !imageLeft && 'md:col-start-4 lg:col-start-3',
              )}
              data-reveal="media"
              id={`${id}-panel`}
              ref={swap.frame}
              role="tabpanel"
            >
              {items.map((item, i) => (
                <div
                  aria-hidden={i !== active || undefined}
                  className="absolute inset-0 [clip-path:inset(0%_0%_0%_0%)]"
                  key={item.id ?? i}
                  ref={(el) => {
                    swap.layers.current[i] = el
                  }}
                  style={{ zIndex: swap.stack.zIndex(i) }}
                >
                  <Media
                    autoPlay={false}
                    fill
                    htmlElement={null}
                    imgClassName="object-cover"
                    ref={(el) => {
                      swap.videos.current[i] = el instanceof HTMLVideoElement ? el : null
                    }}
                    resource={item.media}
                    size="(max-width: 768px) 100vw, 72vw"
                  />
                </div>
              ))}
            </div>
            <div
              className={cn(
                'text-stack md:col-span-3 md:row-start-1 lg:col-span-2',
                imageLeft && 'md:col-start-6 lg:col-start-7',
              )}
            >
              {eyebrow ? (
                <p className={eyebrowClassName} data-reveal>
                  {eyebrow}
                </p>
              ) : null}
              {heading ? (
                <h2 className={cn(type.heading, 'text-balance')} data-reveal>
                  {heading}
                </h2>
              ) : null}
              {description ? (
                <p className={cn(type.body, 'text-muted-foreground text-pretty')} data-reveal>
                  {description}
                </p>
              ) : null}
              <div className="relative" data-reveal onPointerLeave={() => setHover(null)}>
                <span aria-hidden className="bg-foreground/12 absolute inset-y-0 left-0 w-px" />
                <div
                  aria-label={heading ?? 'Items'}
                  aria-orientation="vertical"
                  className="flex flex-col"
                  role="tablist"
                >
                  {items.map((item, i) => {
                    const on = i === active
                    return (
                      <button
                        aria-controls={`${id}-panel`}
                        aria-selected={on}
                        className="focus-visible:outline-ring relative flex w-full touch-manipulation flex-col gap-1 rounded-xs py-3 ps-5 text-left [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:-outline-offset-2"
                        id={`${id}-tab-${i}`}
                        key={item.id ?? i}
                        onClick={() => select(i)}
                        onFocus={() => warm(i)}
                        onKeyDown={onKeyDown(i)}
                        onPointerEnter={(e) => {
                          if (e.pointerType !== 'mouse') return
                          setHover(i)
                          warm(i)
                          window.clearTimeout(dwell.current)
                          dwell.current = window.setTimeout(
                            () => select(i),
                            MEDIA_LIST_MOTION.dwell,
                          )
                        }}
                        onPointerLeave={() => window.clearTimeout(dwell.current)}
                        ref={(el) => {
                          tabs.current[i] = el
                        }}
                        role="tab"
                        tabIndex={on ? 0 : -1}
                        type="button"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'absolute top-1/2 -left-[0.5px] flex -translate-y-1/2 flex-col gap-0.5 transition-opacity duration-360 ease-(--ease-out-quint)',
                            i === hover && !on ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {dashes(i > active ? 'down' : 'up').map((dash) => (
                            <span
                              className={cn('bg-foreground/30 w-0.5', dash.height)}
                              key={dash.key}
                            />
                          ))}
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            'absolute top-1/2 -left-[0.5px] flex -translate-y-1/2 flex-col gap-0.5',
                            on
                              ? '[clip-path:inset(0%_0%_0%_0%)]'
                              : '[clip-path:inset(50%_0%_50%_0%)]',
                          )}
                          ref={(el) => {
                            markers.current[i] = el
                          }}
                        >
                          {dashes(flows[i] ?? 'down').map((dash) => (
                            <span className={cn('bg-brand w-0.5', dash.height)} key={dash.key} />
                          ))}
                        </span>
                        <span
                          className={cn(
                            'flex flex-col gap-1 transition-opacity duration-360 ease-(--ease-out-quint)',
                            on ? 'opacity-100' : i === hover ? 'opacity-85' : 'opacity-45',
                          )}
                        >
                          <span className="flex items-baseline gap-2.5">
                            {numbered ? (
                              <span
                                aria-hidden
                                className="text-muted-foreground w-5 shrink-0 font-mono text-xs tabular-nums"
                              >
                                {ordinalLabel(i)}
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                'text-foreground font-medium',
                                large ? 'text-lg/snug' : 'text-base/snug',
                              )}
                            >
                              {item.title}
                            </span>
                          </span>
                          {item.description ? (
                            <span
                              className={cn(
                                'text-muted-foreground text-pretty',
                                large ? 'text-base' : 'text-sm',
                                numbered && 'ps-7.5',
                              )}
                            >
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </BlockGrid>
        </Container>
      </Section>
    </div>
  )
}

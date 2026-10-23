'use client'

import Link from 'next/link'
import type React from 'react'
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { Media } from '@/components/Media'
import { Visual } from '@/components/Visual'
import {
  type EffectVisual,
  resolveOpening,
  type Visual as VisualValue,
} from '@/features/immersive/visual'
import { useCurtainLink } from '@/features/page-transition/use-curtain-link'
import { cursorTarget } from '@/providers/Cursor/variants'
import { Byline } from '@/sections/MorePosts/MorePosts.client'
import type { MorePostsItem } from '@/sections/MorePosts/query'

/**
 * Where the reading line sits, as a share of the viewport's height: the row
 * whose middle is nearest it is the one the ground shows.
 */
const READING_LINE = 0.45

/** How long the ground rests on a post before its live field may wake, ms. */
const WAKE_AFTER = 1400

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

/**
 * The ground follows the visitor's theme: the post's own page may pin its
 * hero to a face, the index does not, so the type always reads on its own
 * background.
 */
const unpinned = (visual: EffectVisual): EffectVisual =>
  visual.kind === 'streakField'
    ? { kind: 'streakField', descriptor: { ...visual.descriptor, surface: null } }
    : { kind: 'lightLeak', descriptor: { ...visual.descriptor, surface: null } }

/** The post's texture as its opening shows it: the upload, else the effect grounding the hero. */
function groundOf(item: MorePostsItem): VisualValue | null {
  const { ground, media } = resolveOpening(item.hero, {
    fallbackMedia: item.metaImage,
    seedKey: 'hero',
  })
  if (media) return { kind: 'media', media }
  return ground ? unpinned(ground) : null
}

/** Rows either side of the shown one whose light is loaded ahead of the reader. */
const LOAD_AHEAD = 2

type Tone = 'light' | 'dark'

/**
 * An upload's overall value, read off a 16 by 9 sample once it has loaded.
 * Null when it cannot be read (a cross-origin image without CORS).
 */
function toneOf(img: HTMLImageElement): Tone | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 9
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    context.drawImage(img, 0, 0, 16, 9)
    const { data } = context.getImageData(0, 0, 16, 9)
    let sum = 0
    for (let i = 0; i < data.length; i += 4)
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    return sum / (data.length / 4) / 255 < 0.5 ? 'dark' : 'light'
  } catch {
    return null
  }
}

/**
 * The upload's value, so globals.css can print it as a negative where it
 * would fight the theme: a dark texture on the paper ground reads as ink.
 */
function useTone(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [tone, setTone] = useState<Tone | null>(null)
  useEffect(() => {
    const img = enabled ? ref.current?.querySelector('img') : null
    if (!img) return
    const read = () => setTone(toneOf(img))
    if (img.complete && img.naturalWidth > 0) read()
    else img.addEventListener('load', read, { once: true })
    return () => img.removeEventListener('load', read)
  }, [ref, enabled])
  return tone
}

/**
 * One post's light. The shown layer dissolves in with a slow push and the
 * one it replaces fades out under it; a faded layer is hidden, so at most
 * two are ever painted. An effect wakes live once the ground has rested
 * (`lit`); a video upload plays only while it is the one shown.
 */
function Ground({
  item,
  shown,
  lit,
  first,
}: {
  item: MorePostsItem
  shown: boolean
  lit: boolean
  first: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const visual = groundOf(item)
  const media = visual?.kind === 'media'
  const tone = useTone(ref, media)

  useEffect(() => {
    const video = ref.current?.querySelector('video')
    if (!video) return
    if (shown && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      video.play().catch(() => {})
    else video.pause()
  }, [shown])

  return (
    <div
      ref={ref}
      className="posts-index-ground"
      data-kind={media ? 'media' : 'effect'}
      data-shown={shown || undefined}
      data-tone={tone ?? undefined}
    >
      {visual?.kind === 'media' ? (
        <Media
          autoPlay={false}
          crossOrigin="anonymous"
          fill
          htmlElement={null}
          imgClassName="object-cover"
          priority={first}
          resource={visual.media}
          size="100vw"
          videoClassName="size-full object-cover"
        />
      ) : (
        visual && (
          <Visual
            active={lit}
            fill
            placement="block"
            posterClassName="object-cover select-none"
            priority={first}
            size="100vw"
            visual={visual}
          />
        )
      )}
    </div>
  )
}

type RowProps = {
  item: MorePostsItem
  index: number
  shown: boolean
  onPick: (index: number | null) => void
}

function Row({ item, index, shown, onPick }: RowProps) {
  const href = `/posts/${item.slug}`
  const open = useCurtainLink(href, item.hero)
  return (
    <li className="posts-index-row" data-post-row data-shown={shown || undefined}>
      <article>
        <Link
          {...cursorTarget('view')}
          className="posts-index-link"
          href={href}
          onBlur={(event) => {
            if (!event.currentTarget.matches(':hover')) onPick(null)
          }}
          onClick={open}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) onPick(index)
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') onPick(index)
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') onPick(null)
          }}
        >
          <div
            className="posts-index-enter motion-safe:animate-hero-in motion-reduce:animate-hero-fade"
            style={enterAt(260 + Math.min(index, 5) * 70)}
          >
            <div className="posts-index-meta">
              <span aria-hidden className="posts-index-mark" />
              <Byline item={item} />
            </div>
            <div className="min-w-0">
              <h2 className="posts-index-title">{item.title}</h2>
              {item.description && <p className="posts-index-summary">{item.description}</p>}
            </div>
          </div>
        </Link>
      </article>
    </li>
  )
}

type PostsIndexProps = {
  items: MorePostsItem[]
  title: string
  /** Every published post, when this page lists only some of them. */
  total?: number
  /** Under the list: the pages, when there is more than one. */
  children?: ReactNode
}

/**
 * The posts index as a projection room. The titles are the content; the
 * shown post's texture is the light under them, one full-bleed ground held
 * behind the list rather than a picture per row. The row nearest the reading
 * line is shown; on a fine pointer the row under it, or the one the keyboard
 * reaches, takes the light instead. Resting on a post wakes its live field.
 */
export function PostsIndex({ items, title, total = items.length, children }: PostsIndexProps) {
  const [focused, setFocused] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  /** The row whose ground has rested long enough to wake. */
  const [awake, setAwake] = useState<number | null>(null)
  /** Rows whose light has been loaded: the reader's neighbourhood, kept once fetched. */
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(
    () => new Set(Array.from({ length: LOAD_AHEAD + 1 }, (_, i) => i)),
  )
  const listRef = useRef<HTMLOListElement>(null)
  const shown = picked ?? focused
  const count = String(total).padStart(2, '0')

  useEffect(() => {
    setLoaded((current) => {
      const near = Array.from({ length: 2 * LOAD_AHEAD + 1 }, (_, i) => shown - LOAD_AHEAD + i)
      const missing = near.filter((i) => i >= 0 && i < items.length && !current.has(i))
      return missing.length ? new Set([...current, ...missing]) : current
    })
  }, [shown, items.length])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-post-row]'))
    let middles: number[] = []
    let frame = 0

    const read = () => {
      frame = 0
      const line = scrollY + innerHeight * READING_LINE
      let nearest = 0
      let best = Number.POSITIVE_INFINITY
      middles.forEach((middle, i) => {
        const away = Math.abs(middle - line)
        if (away < best) {
          best = away
          nearest = i
        }
      })
      setFocused(nearest)
    }
    // Positions are read once per layout change, never per scroll frame.
    const measure = () => {
      middles = rows.map((row) => {
        const box = row.getBoundingClientRect()
        return box.top + scrollY + box.height / 2
      })
      read()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(list)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      resize.disconnect()
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // The live field waits for the dissolve to land, so a scroll through the
  // list never starts a canvas per row it passes.
  useEffect(() => {
    const wake = setTimeout(() => setAwake(shown), WAKE_AFTER)
    return () => clearTimeout(wake)
  }, [shown])

  if (items.length === 0) return null

  return (
    <div className="posts-index">
      <div aria-hidden className="posts-index-stage">
        <div className="posts-index-light">
          {items.map((item, index) =>
            loaded.has(index) ? (
              <Ground
                first={index === 0}
                item={item}
                key={item.id}
                lit={awake === shown && index === shown}
                shown={index === shown}
              />
            ) : null,
          )}
        </div>
        <div className="posts-index-scrim" />
      </div>

      <div className="posts-index-body">
        <div aria-hidden className="posts-index-veil" />
        <div className="posts-index-column">
          <header className="posts-index-header">
            <h1 className="text-heading-1 flex items-start gap-2.5" id="posts-index-title">
              <span className="overflow-clip pb-[0.08em]">
                <span className="motion-safe:animate-hero-rise motion-reduce:animate-hero-fade inline-block">
                  {title}
                </span>
              </span>
              <span
                aria-hidden
                className="text-xs/none motion-safe:animate-hero-in motion-reduce:animate-hero-fade pt-1 font-mono font-medium tracking-normal tabular-nums"
                style={enterAt(160)}
              >
                {count}
              </span>
            </h1>
          </header>

          <ol ref={listRef} aria-labelledby="posts-index-title" className="posts-index-list">
            {items.map((item, index) => (
              <Row
                index={index}
                item={item}
                key={item.id}
                onPick={setPicked}
                shown={index === shown}
              />
            ))}
          </ol>

          {children}
        </div>
      </div>
    </div>
  )
}

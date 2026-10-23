'use client'

import Link from 'next/link'
import { type CSSProperties, useId } from 'react'
import { Media } from '@/components/Media'
import { Visual } from '@/components/Visual'
import { resolveOpening } from '@/features/immersive/visual'
import { useCurtainLink } from '@/features/page-transition/use-curtain-link'
import { cursorTarget } from '@/providers/Cursor/variants'
import { cn } from '@/utilities/ui'
import type { ContactRecommendation } from './recommendations'

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

/** Beats after `at`: the rule draws, the heading rises, then each card opens a step apart. */
const BEAT = { heading: 120, card: 260, cardStep: 120, copy: 180 } as const

/** Fixed to UTC so the server and the visitor's browser print the same month. */
const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

const FRAME_SIZE = '(min-width: 64rem) 30vw, (min-width: 40rem) 10rem, 7rem'

/** The other cards step back while one is under the pointer, as in More posts. */
const CARD_ITEM =
  'transition-opacity duration-400 ease-[ease] pointer-fine:group-has-[a:hover]/recs:[&:not(:hover)]:opacity-55 motion-reduce:transition-none'

/** The picture: a mask opening top-down over a frame that settles from a slight zoom. */
function Frame({ at, item }: { at: number; item: ContactRecommendation }) {
  const { ground, media, surface } = resolveOpening(item.hero, {
    fallbackMedia: item.media,
    seedKey: 'hero',
  })
  return (
    <div
      className="bg-muted motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade relative aspect-[3/2] w-28 shrink-0 overflow-clip sm:w-40 lg:w-full"
      style={enterAt(at)}
    >
      <div className="motion-safe:animate-hero-settle absolute inset-0" style={enterAt(at)}>
        <div className="relative size-full transition-[scale] duration-1200 ease-(--ease-out-quint) group-focus-visible/rec:scale-[1.035] motion-reduce:transition-none pointer-fine:group-hover/rec:scale-[1.035]">
          {media ? (
            <Media
              fill
              htmlElement={null}
              imgClassName="object-cover"
              resource={media}
              size={FRAME_SIZE}
              videoClassName="size-full object-cover"
            />
          ) : ground ? (
            <div
              className={cn('absolute inset-0', surface && 'bg-background')}
              data-theme={surface ?? undefined}
            >
              <Visual
                active={false}
                fill
                placement="card"
                posterClassName="object-cover select-none"
                size={FRAME_SIZE}
                visual={ground}
              />
            </div>
          ) : (
            <div className="bg-foreground/5 ring-border size-full ring-1 ring-inset" />
          )}
        </div>
      </div>
    </div>
  )
}

/** What it is and whose: "Case study — Client", or the post's month and where it ran. */
function Byline({ item }: { item: ContactRecommendation }) {
  const lead =
    item.kind === 'work' ? (
      <span>Case study</span>
    ) : item.publishedAt ? (
      <time className="tabular-nums" dateTime={item.publishedAt}>
        {monthFormat.format(new Date(item.publishedAt))}
      </time>
    ) : (
      <span>Post</span>
    )
  return (
    <p className="text-muted-foreground text-xs/none flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono">
      {lead}
      {item.context ? (
        <>
          <span aria-hidden className="bg-border h-px w-5" />
          <span>{item.context}</span>
        </>
      ) : null}
    </p>
  )
}

/** Opens behind the page curtain, as the post cards do. */
function Card({ at, item }: { at: number; item: ContactRecommendation }) {
  const open = useCurtainLink(item.href, item.hero)
  return (
    <li className={CARD_ITEM}>
      <Link
        {...cursorTarget('view')}
        className="group/rec focus-visible:outline-ring flex items-start gap-4 rounded-sm outline-offset-8 focus-visible:outline-2 sm:gap-6 lg:flex-col lg:gap-5"
        href={item.href}
        onClick={open}
      >
        <Frame at={at} item={item} />
        <div
          className="motion-safe:animate-hero-in motion-reduce:animate-hero-fade flex min-w-0 flex-col gap-2.5"
          style={enterAt(at + BEAT.copy)}
        >
          <h3 className="text-lg/snug text-pretty lg:text-xl/snug">
            <span className="bg-[linear-gradient(currentColor,currentColor)] box-decoration-clone [background-size:0%_1px] [background-position:0_100%] bg-no-repeat transition-[background-size] duration-700 ease-(--ease-out-quint) group-focus-visible/rec:[background-size:100%_1px] motion-reduce:transition-none pointer-fine:group-hover/rec:[background-size:100%_1px]">
              {item.title}
            </span>
          </h3>
          <Byline item={item} />
        </div>
      </Link>
    </li>
  )
}

/**
 * Under the receipt: a few things to open while the reply is on its way.
 * Enters last, `at` ms after the receipt mounts, once the message has been
 * read back: its rule draws, the heading rises, the cards open in order.
 */
export function Recommended({
  at,
  heading,
  items,
}: {
  at: number
  heading: string
  items: ContactRecommendation[]
}) {
  const headingId = useId()
  if (!items.length) return null

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-8 md:gap-10 lg:col-span-12 lg:mt-8"
    >
      <div className="relative pb-5">
        <h2 className="text-heading-3 motion-reduce:animate-hero-fade" id={headingId}>
          <span className="-my-[0.15em] inline-block overflow-clip py-[0.15em] align-top">
            <span
              className="motion-safe:animate-hero-rise inline-block"
              style={enterAt(at + BEAT.heading)}
            >
              {heading}
            </span>
          </span>
        </h2>
        <span
          aria-hidden
          className="bg-border motion-safe:animate-hero-draw motion-reduce:animate-hero-fade absolute inset-x-0 bottom-0 h-px origin-left"
          style={enterAt(at)}
        />
      </div>
      <ul className="group/recs grid gap-6 lg:grid-cols-3 lg:gap-x-12">
        {items.map((item, i) => (
          <Card at={at + BEAT.card + i * BEAT.cardStep} item={item} key={item.key} />
        ))}
      </ul>
    </section>
  )
}

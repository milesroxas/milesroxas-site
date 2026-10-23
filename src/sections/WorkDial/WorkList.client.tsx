'use client'

import Link from 'next/link'
import { type CSSProperties, useRef, ViewTransition } from 'react'
import { Media } from '@/components/Media'
import { useWorkCardMorph } from '@/heros/WorkHero/morph'
import { cursorTarget } from '@/providers/Cursor/variants'
import type { MoreWorkItem } from '@/sections/MoreWork/query'

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

function WorkCard({ item, index }: { item: MoreWorkItem; index: number }) {
  const { slug, title, client, industry, summary, media } = item
  const href = `/works/${slug}`
  const pictureRef = useRef<HTMLDivElement>(null)
  const morph = useWorkCardMorph(slug, href, pictureRef, undefined, { travel: true })
  // Only the first screen enters; cards further down are already in place when reached.
  const step = Math.min(index, 3) * 80

  return (
    <li className="group has-focus-visible:outline-foreground relative rounded-[2px] has-focus-visible:outline-2 has-focus-visible:outline-offset-4">
      <ViewTransition default="none" name={morph.name} onShare={morph.onShare} share="work-morph">
        {/* Press: held back a beat, so a finger that starts a scroll never dents the card. */}
        <div
          ref={pictureRef}
          className="bg-muted motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade relative aspect-[1.6] w-full overflow-clip transition-transform duration-300 ease-(--ease-out-quint) group-has-[a:active]:scale-[0.98] group-has-[a:active]:delay-75 group-has-[a:active]:duration-150"
          style={enterAt(200 + step)}
        >
          {media && (
            <Media
              fill
              htmlElement={null}
              imgClassName="object-cover"
              resource={media}
              size="(min-width: 40rem) 50vw, 100vw"
              videoClassName="size-full object-cover"
            />
          )}
        </div>
      </ViewTransition>
      <div
        className="motion-safe:animate-hero-in motion-reduce:animate-hero-fade mt-4"
        style={enterAt(360 + step)}
      >
        <p className="flex min-w-0 items-center gap-2.5 font-mono text-xs/tight">
          {client && <span className="truncate font-medium">{client}</span>}
          {client && industry && <span aria-hidden className="bg-border h-px w-4 shrink-0" />}
          {industry && <span className="text-muted-foreground truncate">{industry}</span>}
        </p>
        <h2 className="mt-2 text-2xl/[1.2] font-light tracking-[-0.015em] text-balance">
          {/* The whole card is the target; the title names it. */}
          <Link
            {...cursorTarget('view')}
            className="outline-none after:absolute after:inset-0"
            href={href}
            onClick={morph.onClick}
            transitionTypes={morph.transitionTypes}
          >
            {title}
          </Link>
        </h2>
        {summary && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-base text-pretty">{summary}</p>
        )}
      </div>
    </li>
  )
}

type WorkListProps = {
  items: MoreWorkItem[]
  title: string
  lead?: string | null
}

/**
 * The works index below 64rem. The dial needs a pointer and room to turn; a
 * phone reads the work as a plain, natively scrolled list, every work with
 * its own picture, client and summary, so a reviewer browses at the speed of
 * their thumb. Nothing is pinned and nothing runs on scroll. A card opens its
 * case study by carrying its picture to the hero frame, as the dial does.
 */
export function WorkList({ items, title, lead }: WorkListProps) {
  const count = String(items.length).padStart(2, '0')

  return (
    <div className="px-gutter pt-[calc(var(--chrome-top)+--spacing(8))] pb-[calc(var(--dock-clearance)+--spacing(16))]">
      <header className="mb-10 sm:mb-14">
        <h1 className="text-heading-1 flex items-start gap-2.5" id="works-list-title">
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
        {lead && (
          <p
            className="text-muted-foreground motion-safe:animate-hero-in motion-reduce:animate-hero-fade mt-3 max-w-[34ch] text-base text-pretty"
            style={enterAt(240)}
          >
            {lead}
          </p>
        )}
      </header>
      <ol
        aria-labelledby="works-list-title"
        className="sm:gap-x-gutter grid grid-cols-[minmax(0,1fr)] gap-y-14 sm:grid-cols-2 sm:gap-y-16"
      >
        {items.map((item, index) => (
          <WorkCard index={index} item={item} key={item.id} />
        ))}
      </ol>
    </div>
  )
}

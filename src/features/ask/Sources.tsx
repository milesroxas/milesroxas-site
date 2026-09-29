'use client'

import { IconArrowRight, IconChevronRight } from '@tabler/icons-react'
import type { SourceUrlUIPart } from 'ai'
import Link from 'next/link'
import { useId, useState } from 'react'
import { glyphForPath } from '@/components/SiteChrome/glyphs'
import { surfaceForPath } from '@/shared/content/surfaces'
import { cn } from '@/utilities/ui'

/** Row and header tint: the group's own tinted ground, a step toward the ink. */
const ROW_HOVER = 'hover:bg-foreground/3'

/** Inset so the ring survives the transcript item's paint containment and the body's clip. */
const ROW_FOCUS = 'outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50'

/**
 * The pages an answer drew on, as a disclosure group (Apple's inset grouped
 * list): collapsed to one "Sources" row with the count trailing as a value,
 * so the answer stays the thing read first. A single source starts open: one
 * row costs less to show than a disclosure costs to open.
 *
 * The chevron sits in the leading lane like a disclosure triangle, pointing
 * right when closed and turning down when open; a trailing chevron would read
 * as "opens another screen". The body is the site's shared disclosure track
 * (`.disclosure-body`, globals.css), so it opens and closes on the same beat
 * as the FAQ and the stepped form, and goes `inert` while closed so its links
 * leave the tab order (and are never prefetched unseen).
 *
 * The rows are one raised white group inside the muted well, split by
 * inset hairlines that start at the title lane; a hovered or focused row
 * hides the hairlines on both of its edges so the tint reads as one shape.
 * Every lane is a fixed-width slot, so glyphs, titles and arrows line up
 * down the list whatever the titles say. A title wraps to a second line
 * before it truncates.
 */
export function AskSources({ sources }: { sources: SourceUrlUIPart[] }) {
  const [open, setOpen] = useState(sources.length === 1)
  const listId = useId()

  return (
    <div className="rounded-[0.625rem] bg-foreground/5">
      <button
        aria-controls={listId}
        aria-expanded={open}
        className={cn(
          'group/disclosure pressable pressable-subtle flex min-h-10 w-full items-center gap-2 rounded-[0.625rem] px-2.5 text-left aria-expanded:rounded-b-none md:min-h-8',
          ROW_HOVER,
          ROW_FOCUS,
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center">
          <IconChevronRight className="size-3.5 text-muted-foreground transition-[rotate,color] duration-200 ease-out-quint group-hover/disclosure:text-foreground group-aria-expanded/disclosure:rotate-90 motion-reduce:transition-none" />
        </span>
        <span className="min-w-0 flex-1 text-xs/4 font-medium">Sources</span>
        <span className="min-w-4 text-right text-xs/4 text-muted-foreground tabular-nums transition-colors group-hover/disclosure:text-foreground">
          {sources.length}
        </span>
      </button>

      <div className="disclosure-body" data-open={open || undefined} id={listId} inert={!open}>
        <div>
          <ul className="mx-1 mb-1 overflow-hidden rounded-md bg-popover shadow-xs ring-1 ring-foreground/6">
            {sources.map((source) => (
              <SourceRow key={source.sourceId} source={source} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function SourceRow({ source }: { source: SourceUrlUIPart }) {
  const surface = surfaceForPath(source.url)
  // The dock's mark for the same destination, so a row says what kind of
  // page it opens before its title is read.
  const Glyph = glyphForPath(source.url)

  return (
    <li className="group/row">
      <Link
        className={cn(
          'group/source pressable pressable-subtle relative flex min-h-11 items-center gap-2.5 px-2.5 py-1.5 md:min-h-10',
          ROW_HOVER,
          ROW_FOCUS,
          // The inset hairline between rows (none above the first, which the
          // group's own edge closes), hidden beside a tinted neighbor: this
          // row or the row above it.
          'before:absolute before:top-0 before:right-0 before:left-12 before:h-px before:bg-border group-first/row:before:hidden',
          'hover:before:opacity-0 focus-visible:before:opacity-0',
          '[li:hover+li>&]:before:opacity-0 [li:has(:focus-visible)+li>&]:before:opacity-0',
        )}
        href={source.url}
      >
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-foreground/6"
        >
          <Glyph className="size-3.5 text-primary" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="line-clamp-2 text-[0.9375rem]/5 md:text-[0.8125rem]/4.5">
            {source.title ?? source.url}
          </span>
          {surface ? (
            <span className="truncate text-xs/4 text-muted-foreground">{surface.title}</span>
          ) : null}
        </span>
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          <IconArrowRight className="size-3.5 text-muted-foreground motion-safe:transition-[translate,color] motion-safe:duration-150 motion-safe:ease-out group-hover/source:text-foreground pointer-fine:group-hover/source:translate-x-px" />
        </span>
      </Link>
    </li>
  )
}

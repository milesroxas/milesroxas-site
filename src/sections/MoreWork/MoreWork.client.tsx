'use client'

import { IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { type RefObject, useEffect, useId, useMemo, useRef, useState, ViewTransition } from 'react'
import { Media } from '@/components/Media'
import { choreographWorkMorph, useWorkCardMorph, workMorphName } from '@/heros/WorkHero/morph'
import { cursorTarget } from '@/providers/Cursor/variants'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { MORE_WORK_MOTION, moreWorkMotionStyle } from './motion'
import { isPlateLayout, MoreWorkPlate } from './Plate'
import type { MoreWorkItem } from './query'

const workHref = (slug: string) => `/works/${slug}`

/** The row being opened, and whether its picture is the plate or its own. */
type Opening = { slug: string; onPlate: boolean }

type RowProps = {
  item: MoreWorkItem
  index: number
  active: boolean
  /** This row is opening through its own picture: name it for the morph. */
  morphing: boolean
  plateRef: RefObject<HTMLDivElement | null>
  /** `now` skips the hover intent: focus and clicks are deliberate. */
  onActivate: (index: number, now?: boolean) => void
  onOpen: (slug: string) => void
}

/**
 * One work in the index. With the plate (`plate:`), hovering or focusing the
 * row shows its picture there and inks the row; elsewhere every row is in
 * full ink and carries its own picture. Either picture opens into the case
 * study's hero the way a work card does (`useWorkCardMorph`).
 */
function MoreWorkRow({ item, index, active, morphing, plateRef, onActivate, onOpen }: RowProps) {
  const { slug, title, industry, capabilities, media } = item
  const href = workHref(slug)
  const thumbRef = useRef<HTMLDivElement>(null)
  // Resolved at click: whichever picture this layout shows stays while the page clears.
  const pictureRef = useMemo(
    () => ({
      get current() {
        return isPlateLayout() ? plateRef.current : thumbRef.current
      },
    }),
    [plateRef],
  )
  const morph = useWorkCardMorph(slug, href, pictureRef, () => onOpen(slug))
  const handleClick = (event: React.MouseEvent) => {
    onActivate(index, true)
    morph.onClick(event)
  }
  const services = capabilities.join(', ')

  return (
    <li
      className="group border-border border-b transition-colors duration-(--more-work-ink) ease-[ease] plate:data-active:border-foreground"
      data-active={active || undefined}
    >
      {/* Each row is its own shell, so rows enter as they reach the line. */}
      <ScrollReveal as="div" variant="underMedia">
        <Link
          {...cursorTarget('view')}
          className="flex flex-col gap-5 plate:gap-6 py-7 md:flex-row md:items-start md:gap-8"
          href={href}
          onClick={handleClick}
          onFocus={() => onActivate(index, true)}
          onPointerEnter={() => onActivate(index)}
          transitionTypes={['work-open']}
        >
          {media && (
            <ViewTransition
              default="none"
              name={morphing ? workMorphName(slug) : undefined}
              onShare={morph.onShare}
              share="work-morph"
            >
              <div
                ref={thumbRef}
                className="relative plate:hidden aspect-[1.6] w-full shrink-0 overflow-clip bg-muted md:w-2/5"
                data-reveal="media"
              >
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={media}
                  size="(min-width: 48rem) 40vw, 100vw"
                  videoClassName="size-full object-cover"
                />
              </div>
            </ViewTransition>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5" data-reveal>
            <h3 className="text-pretty plate:text-muted-foreground text-heading-3 tracking-[-0.02em] transition-colors duration-(--more-work-ink) ease-[ease] plate:group-data-active:text-foreground">
              {title}
            </h3>
            {(industry || services) && (
              <p className="flex plate:flex-row flex-col plate:flex-wrap plate:items-center gap-1 plate:gap-x-2.5 text-base text-muted-foreground">
                {industry && <span>{industry}</span>}
                {industry && services && (
                  <span aria-hidden className="plate:block hidden h-px w-6 bg-border" />
                )}
                {services && <span>{services}</span>}
              </p>
            )}
          </div>
          <IconArrowRight
            aria-hidden
            className="mt-2.5 plate:block hidden size-4 shrink-0 -translate-x-1.5 opacity-0 transition-[opacity,translate] duration-(--more-work-ink) ease-(--ease-out-quint) plate:group-data-active:translate-x-0 plate:group-data-active:opacity-100"
            stroke={1.5}
          />
        </Link>
      </ScrollReveal>
    </li>
  )
}

/**
 * "More work" (approved in Paper, "Related Work — 1 Index"): a contents page
 * of other case studies with one living plate beside it. The plate column
 * sticks while the index scrolls; the caption names what it shows.
 */
export function MoreWorkIndex({ items }: { items: MoreWorkItem[] }) {
  const [active, setActive] = useState(0)
  const [opening, setOpening] = useState<Opening | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const shown = items[active] ?? items[0]
  // The plate follows a row the pointer rests on, not every row it crosses.
  const intent = useRef<ReturnType<typeof setTimeout>>(undefined)
  const settle = () => clearTimeout(intent.current)
  useEffect(() => () => clearTimeout(intent.current), [])
  const activate = (index: number, now = false) => {
    settle()
    // Once a row opens, the plate holds its picture while the page clears around it.
    if (opening) return
    if (now) setActive(index)
    else intent.current = setTimeout(() => setActive(index), MORE_WORK_MOTION.hoverIntent)
  }
  // One picture carries the morph: two mounted under one name would break it.
  const open = (slug: string) => setOpening({ slug, onPlate: isPlateLayout() })

  return (
    <section
      aria-labelledby={headingId}
      className="px-gutter pb-[calc(var(--dock-clearance)+--spacing(12))] md:pb-40"
      data-slot="more-work"
      style={moreWorkMotionStyle}
    >
      <div className="flex flex-col gap-12 border-border border-t pt-20 md:gap-16 md:pt-40">
        <ScrollReveal as="div" className="flex items-end justify-between gap-6" variant="intro">
          <h2
            className="flex items-start gap-3 text-title leading-none"
            data-reveal
            data-reveal-group="more-work-intro"
            id={headingId}
          >
            More work
            <span aria-hidden className="pt-1 font-medium font-mono text-sm/none tabular-nums">
              {String(items.length).padStart(2, '0')}
            </span>
          </h2>
          <Link
            className="group/all flex shrink-0 items-center gap-2.5 pb-1 font-medium text-base"
            data-reveal
            data-reveal-group="more-work-intro"
            href="/works"
          >
            All work
            <IconArrowRight
              aria-hidden
              className="size-4 transition-transform duration-(--more-work-ink) ease-(--ease-out-quint) pointer-fine:group-hover/all:translate-x-0.5"
              stroke={1.5}
            />
          </Link>
        </ScrollReveal>
        <div className="grid plate:grid-cols-[minmax(0,55fr)_minmax(0,53fr)] plate:items-start plate:gap-12">
          <div
            aria-hidden
            className="plate:sticky plate:top-[calc(var(--chrome-top)+--spacing(6))] plate:block hidden"
          >
            {/* Plate and caption are one window: on a sticky column a caption gated
                on its own position would wait until the column releases. */}
            <ScrollReveal as="div" variant="underMedia">
              <div className="flex flex-col gap-4" data-reveal="media">
                <ViewTransition
                  default="none"
                  name={opening?.onPlate ? workMorphName(opening.slug) : undefined}
                  onShare={choreographWorkMorph}
                  share="work-morph"
                >
                  <MoreWorkPlate
                    index={active}
                    items={items}
                    opening={Boolean(opening)}
                    ref={plateRef}
                  />
                </ViewTransition>
                <div className="flex items-center justify-between gap-4 font-mono text-xs/none">
                  <span className="truncate font-medium">{shown?.client ?? shown?.title}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {active + 1} of {items.length}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <ul className="border-foreground border-t" onPointerLeave={settle}>
            {items.map((item, index) => (
              <MoreWorkRow
                active={index === active}
                index={index}
                item={item}
                key={item.id}
                onActivate={activate}
                morphing={opening?.slug === item.slug && !opening.onPlate}
                onOpen={open}
                plateRef={plateRef}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

import { IconDownload } from '@tabler/icons-react'
import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { CMSLink } from '@/components/Link'
import { buttonVariants } from '@/components/ui/button'
import { HeroCopy, heroMeta } from '@/heros/HeroCopy'
import { pixelFont } from '@/heros/InstrumentHero/pixelFont'
import type { Page } from '@/payload-types'
import { linkKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'
import { liftGeometry } from './geometry'

type Hero = Page['hero']
type Link = NonNullable<Hero['links']>[number]['link']

const FILE_LINK = /\.(dmg|pkg|zip|exe|msi|appimage|deb|rpm)$/i

/**
 * The opening's load-in, in ms after it mounts, all in CSS from first paint.
 * The copy enters first: the eyebrow, the title at 90 and the lede at 200
 * (set in `LiftHero`'s `titleClassName`), then the links. The figure follows:
 * the dashed baseline traces, the readout's plate and display switch on,
 * then the band draws from left to right while the readout counts the gain
 * on the same curve (`lift-draw`, `lift-count`), so the number lands as the
 * line does. Each label lands as the band reaches it.
 */
const BEAT = {
  eyebrow: 0,
  link: 340,
  linkStep: 80,
  baseline: 240,
  plate: 560,
  display: 700,
  baselineLabel: 760,
  band: 860,
  first: 1160,
  latest: 2200,
  readoutLabel: 2660,
} as const

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as React.CSSProperties

const enterIn = 'motion-safe:animate-hero-in motion-reduce:animate-hero-fade'

/** A figure label: `hero-in` on `transform`, so it keeps its own `translate`. */
const labelIn = 'motion-safe:animate-lift-in motion-reduce:animate-lift-fade'

/** A primary link that installs something leads with the download glyph. */
const isDownload = (link: Link) =>
  FILE_LINK.test(link.url ?? '') || /^download\b/i.test(link.label ?? '')

/**
 * The two ways in: the first link as the paper `xl` button, the second as a
 * paper label over a 2px orange rule (as App download's All releases).
 */
const LiftLinks: React.FC<{ links: Hero['links'] }> = ({ links }) => {
  if (!Array.isArray(links) || links.length === 0) return null
  return (
    <ul className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
      {links.map(({ link }, i) => (
        <li
          className={enterIn}
          key={linkKeys.fromLink(link, i)}
          style={enterAt(BEAT.link + i * BEAT.linkStep)}
        >
          {i === 0 ? (
            <CMSLink
              {...link}
              appearance="inline"
              className={buttonVariants({ size: 'xl', variant: 'default' })}
              label={null}
            >
              {isDownload(link) ? <IconDownload aria-hidden className="text-brand" /> : null}
              {link.label}
            </CMSLink>
          ) : (
            <CMSLink
              {...link}
              appearance="inline"
              className="border-brand hover:text-muted-foreground border-b-2 pb-1 text-sm font-medium transition-colors"
            />
          )}
        </li>
      ))}
    </ul>
  )
}

const pct = (value: number, of: number) => `${(value / of) * 100}%`

/**
 * The figure: the score as a band that steps up from the first version
 * (left) to the latest (right), over a dashed baseline for the run without
 * it. Heights come from the scores (`liftGeometry`); the band stretches to
 * the page width and its thickness scales with the figure's height, so the
 * labels sit in percentages of the same frame. Ink on paper, paper on ink:
 * the band is the foreground and its values the ground, in either theme.
 */
const LiftFigure: React.FC<{ lift: NonNullable<Hero['lift']> }> = ({ lift }) => {
  const { first, latest, baseline } = lift
  if (first?.score == null || latest?.score == null) return null
  const g = liftGeometry({
    baseline: baseline?.score ?? 0,
    first: first.score,
    latest: latest.score,
  })
  const summary = [
    `${first.label}: ${first.score}.`,
    `${latest.label}: ${latest.score}.`,
    baseline?.label && baseline.score != null ? `${baseline.label}: ${baseline.score}.` : null,
  ]
    .filter(Boolean)
    .join(' ')
  const value = 'font-mono text-base/none tabular-nums text-background'

  return (
    <figure aria-label={summary} className="relative h-60 md:h-[300px]" role="img">
      <svg
        aria-hidden
        className="motion-safe:animate-lift-draw motion-reduce:animate-lift-fade absolute inset-0 size-full"
        preserveAspectRatio="none"
        style={enterAt(BEAT.band)}
        viewBox={`0 0 ${g.width} ${g.height}`}
      >
        <path className="fill-foreground" d={g.path} />
      </svg>
      {baseline?.score != null ? (
        <div
          aria-hidden
          className="border-muted-foreground motion-safe:animate-lift-trace motion-reduce:animate-lift-fade absolute inset-x-0 bottom-0 border-t border-dashed"
          style={enterAt(BEAT.baseline)}
        />
      ) : null}
      <div aria-hidden className="container h-full">
        <div className="relative h-full">
          <span
            className={cn(heroMeta, labelIn, 'absolute left-0 -translate-y-[calc(100%+0.875rem)]')}
            style={{ top: pct(g.first.top, g.height), ...enterAt(BEAT.first) }}
          >
            {first.label}
          </span>
          <span
            className={cn(value, labelIn, 'absolute left-0 -translate-y-1/2')}
            style={{ top: pct(g.first.center, g.height), ...enterAt(BEAT.first) }}
          >
            {first.score}
          </span>
          <span
            className={cn(heroMeta, labelIn, 'absolute right-0 -translate-y-[calc(100%+0.875rem)]')}
            style={{ top: pct(g.latest.top, g.height), ...enterAt(BEAT.latest) }}
          >
            {latest.label}
          </span>
          <span
            className={cn(value, labelIn, 'absolute right-0 -translate-y-1/2')}
            style={{ top: pct(g.latest.center, g.height), ...enterAt(BEAT.latest) }}
          >
            {latest.score}
          </span>
          {baseline?.label && baseline.score != null ? (
            <span
              className={cn(heroMeta, labelIn, 'absolute right-0 bottom-3.5')}
              style={enterAt(BEAT.baselineLabel)}
            >
              {baseline.label}, {baseline.score}
            </span>
          ) : null}
        </div>
      </div>
    </figure>
  )
}

/**
 * The gain as a pixel readout: fluoro digits on the dark ground; on paper,
 * ink digits on a fluoro plate (yellow never carries text on paper). Each
 * digit is a strip of every count from zero to the gain, resting on the
 * last, so the load-in rolls it like an odometer while the band draws.
 * The plate pads the digits on paper only, so they keep one size.
 */
const LiftReadout: React.FC<{ gain: number; label?: string | null }> = ({ gain, label }) => {
  const size = Math.abs(gain)
  const sign = gain >= 0 ? '+' : '−'
  const width = String(size).length
  const counts = Array.from({ length: size + 1 }, (_, k) => String(k).padStart(width, '0'))
  const columns = Array.from({ length: width }, (_, c) => ({ key: `digit-${c}`, c }))

  return (
    <div className="flex flex-col gap-4 md:col-span-3 md:items-end">
      <p className="text-foreground dark:text-fluoro relative isolate flex self-start px-[0.07em] py-[0.05em] font-[family-name:var(--font-geist-pixel-square)] text-[clamp(4.5rem,2rem+8vw,11rem)] leading-none tabular-nums md:self-end dark:p-0">
        <span className="sr-only">
          {sign}
          {size}
        </span>
        <span
          aria-hidden
          className="bg-fluoro motion-safe:animate-hero-draw motion-reduce:animate-lift-fade absolute inset-0 -z-10 origin-left dark:hidden"
          style={enterAt(BEAT.plate)}
        />
        <span
          aria-hidden
          className="motion-safe:animate-lift-power motion-reduce:animate-lift-fade flex"
          style={enterAt(BEAT.display)}
        >
          <span>{sign}</span>
          {columns.map(({ key, c }) => (
            <span className="h-[1em] overflow-clip" key={key}>
              <span
                className="motion-safe:animate-lift-count flex flex-col"
                style={{ translate: `0 ${-size}em`, ...enterAt(BEAT.band) }}
              >
                {counts.map((count) => (
                  <span className="h-[1em]" key={count}>
                    {count[c]}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </span>
      </p>
      {label ? (
        <p className={cn(heroMeta, labelIn)} style={enterAt(BEAT.readoutLabel)}>
          {label}
        </p>
      ) : null}
    </div>
  )
}

/**
 * The Lift opening, in the visitor's theme: the copy and the two ways in on
 * columns 1 to 5, the gain as a pixel readout on the right (the one fluoro
 * in the view), and the score figure across the foot of the band. The copy
 * enters first; the figure then tells the gain (`BEAT`). Drawn as
 * `skillStudioHero` in design-system/screens/pages/skill-studio.elyx.
 */
export const LiftHero: React.FC<Hero> = ({ lift, links, richText }) => {
  const first = lift?.first?.score
  const latest = lift?.latest?.score
  const gain = first != null && latest != null ? latest - first : null

  return (
    <section
      className={cn(
        pixelFont.variable,
        'bg-background text-foreground relative isolate flex min-h-svh flex-col overflow-clip',
      )}
    >
      <div className="container pt-[calc(var(--chrome-top)+4rem)] pb-6">
        <BlockGrid className="gap-y-12 md:items-start">
          <div className="flex flex-col gap-6 md:col-span-5">
            {lift?.eyebrow ? (
              <p className={cn(heroMeta, enterIn)} style={enterAt(BEAT.eyebrow)}>
                {lift.eyebrow}
              </p>
            ) : null}
            <HeroCopy
              richText={richText}
              titleClassName={cn(
                '[&_p]:text-muted-foreground [&_p]:max-w-[34ch]',
                '[&_h1]:motion-safe:animate-hero-in [&_h1]:motion-reduce:animate-hero-fade',
                '[&_p]:motion-safe:animate-hero-in [&_p]:motion-reduce:animate-hero-fade',
                '[&_h1]:[--enter-at:90ms] [&_p]:[--enter-at:200ms]',
              )}
            />
            <LiftLinks links={links} />
          </div>
          {gain != null ? <LiftReadout gain={gain} label={lift?.readoutLabel} /> : null}
        </BlockGrid>
      </div>
      {lift ? (
        <div className="mt-auto pb-[calc(var(--dock-clearance)+--spacing(8))]">
          <LiftFigure lift={lift} />
        </div>
      ) : null}
    </section>
  )
}

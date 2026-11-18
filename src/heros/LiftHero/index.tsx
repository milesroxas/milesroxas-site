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
        <li key={linkKeys.fromLink(link, i)}>
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
 * The figure: the score as a paper band that steps up from the first version
 * (left) to the latest (right), over a dashed baseline for the run without
 * it. Heights come from the scores (`liftGeometry`); the band stretches to
 * the page width and its thickness scales with the figure's height, so the
 * labels sit in percentages of the same frame.
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
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox={`0 0 ${g.width} ${g.height}`}
      >
        <path className="fill-foreground" d={g.path} />
      </svg>
      {baseline?.score != null ? (
        <div
          aria-hidden
          className="border-muted-foreground absolute inset-x-0 bottom-0 border-t border-dashed"
        />
      ) : null}
      <div aria-hidden className="container h-full">
        <div className="relative h-full">
          <span
            className={cn(heroMeta, 'absolute left-0 -translate-y-[calc(100%+0.875rem)]')}
            style={{ top: pct(g.first.top, g.height) }}
          >
            {first.label}
          </span>
          <span
            className={cn(value, 'absolute left-0 -translate-y-1/2')}
            style={{ top: pct(g.first.center, g.height) }}
          >
            {first.score}
          </span>
          <span
            className={cn(heroMeta, 'absolute right-0 -translate-y-[calc(100%+0.875rem)]')}
            style={{ top: pct(g.latest.top, g.height) }}
          >
            {latest.label}
          </span>
          <span
            className={cn(value, 'absolute right-0 -translate-y-1/2')}
            style={{ top: pct(g.latest.center, g.height) }}
          >
            {latest.score}
          </span>
          {baseline?.label && baseline.score != null ? (
            <span className={cn(heroMeta, 'absolute right-0 bottom-3.5')}>
              {baseline.label}, {baseline.score}
            </span>
          ) : null}
        </div>
      </div>
    </figure>
  )
}

/**
 * The Lift opening, on the always-dark hero ground: the copy and the two ways
 * in on columns 1 to 5, the gain as a fluoro pixel readout on the right (the
 * one fluoro in the view), and the score figure across the foot of the band.
 * Drawn as `skillStudioHero` in design-system/screens/pages/skill-studio.elyx.
 */
export const LiftHero: React.FC<Hero> = ({ lift, links, richText }) => {
  const gain =
    lift?.first?.score != null && lift.latest?.score != null
      ? lift.latest.score - lift.first.score
      : null

  return (
    <section
      className={cn(
        pixelFont.variable,
        'bg-background text-foreground relative isolate flex min-h-svh flex-col overflow-clip',
      )}
      data-theme="dark"
    >
      <div className="container pt-[calc(var(--chrome-top)+4rem)] pb-6">
        <BlockGrid className="gap-y-12 md:items-start">
          <div className="flex flex-col gap-6 md:col-span-5">
            {lift?.eyebrow ? <p className={heroMeta}>{lift.eyebrow}</p> : null}
            <HeroCopy
              richText={richText}
              titleClassName="[&_p]:text-muted-foreground [&_p]:max-w-[34ch]"
            />
            <LiftLinks links={links} />
          </div>
          {gain != null ? (
            <div className="flex flex-col gap-4 md:col-span-3 md:items-end">
              <p className="text-fluoro font-[family-name:var(--font-geist-pixel-square)] text-[clamp(4.5rem,2rem+8vw,11rem)] leading-[0.9] tabular-nums">
                {gain >= 0 ? '+' : '−'}
                {Math.abs(gain)}
              </p>
              {lift?.readoutLabel ? <p className={heroMeta}>{lift.readoutLabel}</p> : null}
            </div>
          ) : null}
        </BlockGrid>
      </div>
      {lift ? (
        <div className="mt-auto pb-8">
          <LiftFigure lift={lift} />
        </div>
      ) : null}
    </section>
  )
}

import type { ReactNode } from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText/Legacy'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import { resolveOpening } from '@/features/immersive/visual'
import { HeroGround } from '@/heros/HeroGround'
import { WorkHeroTitle } from '@/heros/WorkHero/parts'
import type { Category, Media as MediaType, Post } from '@/payload-types'
import { externalArticle } from '@/utilities/externalArticle'
import { cn } from '@/utilities/ui'
import { BEAT, enterAt, enterIn } from './parts'

type Props = {
  post: Pick<
    Post,
    'categories' | 'external' | 'hero' | 'populatedAuthors' | 'publishedAt' | 'source' | 'title'
  >
}

/** Fixed to UTC so the server and the visitor's browser print the same day. */
const publishedFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
})

/** Uploads predating stored dimensions frame at the cards' 16:9. */
const frameRatio = ({ width, height }: MediaType) => (width && height ? width / height : 16 / 9)

type Fact = { label: string; value: ReactNode }

function postFacts(post: Props['post']): Fact[] {
  const { categories, populatedAuthors, publishedAt } = post
  const external = externalArticle(post)
  const authors = populatedAuthors?.map(({ name }) => name).filter(Boolean)
  const filed = categories
    ?.filter((category): category is Category => typeof category === 'object' && !!category)
    .map(({ title }) => title)

  const facts: (Fact | null)[] = [
    publishedAt
      ? {
          label: 'Published',
          value: (
            <time dateTime={publishedAt}>{publishedFormat.format(new Date(publishedAt))}</time>
          ),
        }
      : null,
    authors?.length ? { label: 'By', value: authors.join(', ') } : null,
    filed?.length ? { label: 'Filed under', value: filed.join(', ') } : null,
    external ? { label: 'Published on', value: external.publisher } : null,
  ]
  return facts.filter((fact): fact is Fact => fact !== null)
}

/**
 * The Editorial opening (hero type `editorial`), set like a magazine feature:
 * the title and a byline strip (when and where it ran) on one side, the hero
 * media on the other as a featured image at its own proportions, never
 * cropped into a background and never wider than its column. The byline and
 * the picture share a foot line. On a phone they stack, title first. Without
 * media the opening is only the title and byline. An effect chosen on the
 * hero grounds the whole band behind both; a pinned face paints the band.
 * Otherwise it paints the visitor's theme, like the case study opening.
 */
export function PostHero({ post }: Props) {
  const { hero, title } = post
  const { ground, media, surface } = resolveOpening(hero, { seedKey: 'hero' })
  const facts = postFacts(post)

  return (
    <header
      className={cn(
        'grid gap-10 bg-background px-gutter pt-[calc(var(--chrome-top)+--spacing(10))] pb-16 text-foreground md:items-end md:gap-x-16 md:pt-[calc(var(--chrome-top)+--spacing(20))] md:pb-24 md:has-data-[slot=post-hero-media]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]',
        ground && 'relative isolate overflow-clip',
      )}
      data-slot="post-hero"
      data-theme={surface ?? undefined}
    >
      <div className="flex flex-col gap-10 md:gap-14">
        {title && (
          <div>
            <WorkHeroTitle className="max-w-[22ch] text-balance">{title}</WorkHeroTitle>
            <ChromeTitle title={title} />
          </div>
        )}

        {facts.length > 0 && (
          <div className="flex flex-col gap-5 md:gap-6">
            <span
              aria-hidden
              className="block h-px origin-left bg-border motion-safe:animate-hero-draw motion-reduce:animate-hero-fade"
              style={enterAt(BEAT.rule)}
            />
            <dl className="flex flex-wrap gap-x-12 gap-y-5">
              {facts.map(({ label, value }, i) => (
                <div
                  className={cn('flex flex-col gap-2', enterIn)}
                  key={label}
                  style={enterAt(BEAT.byline + i * BEAT.bylineItem)}
                >
                  <dt className="font-medium font-mono text-muted-foreground text-trim text-xs/none">
                    {label}
                  </dt>
                  <dd className="text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {media && <FeaturedImage media={media} />}
      <HeroGround ground={ground} handoff={!media} />
    </header>
  )
}

/**
 * The featured image at its own proportions, as wide as its column while no
 * taller than the frame cap; a tall picture narrows and keeps to the column's
 * outer edge. The caption sits under it at the frame's width.
 */
function FeaturedImage({ media }: { media: MediaType }) {
  const ratio = frameRatio(media)
  return (
    <figure
      className="flex flex-col gap-3 md:justify-self-end"
      style={{ width: `min(100%, min(60svh, 34rem) * ${ratio})` }}
    >
      <div
        className="relative w-full overflow-clip bg-muted motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade"
        data-hero-media=""
        data-slot="post-hero-media"
        style={{ ...enterAt(BEAT.media), aspectRatio: ratio }}
      >
        <Media
          fill
          imgClassName="object-cover motion-safe:animate-hero-settle"
          priority
          resource={media}
          size="(min-width: 48rem) 42vw, 100vw"
          videoClassName="object-cover motion-safe:animate-hero-settle"
        />
      </div>
      {media.caption && (
        <figcaption
          className={cn('text-muted-foreground text-sm', enterIn)}
          style={enterAt(BEAT.caption)}
        >
          <RichText data={media.caption} enableGutter={false} enableProse={false} />
        </figcaption>
      )}
    </figure>
  )
}

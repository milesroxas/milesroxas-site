import type { ReactNode } from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText/Legacy'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import { WorkHeroTitle } from '@/heros/WorkHero/parts'
import type { Category, Media as MediaType, Post } from '@/payload-types'
import { externalArticle } from '@/utilities/externalArticle'
import { cn } from '@/utilities/ui'
import { BEAT, enterAt, enterIn } from './parts'
import { PostHeroRoot } from './Root.client'

type Props = {
  post: Pick<
    Post,
    'categories' | 'external' | 'hero' | 'populatedAuthors' | 'publishedAt' | 'source' | 'title'
  >
}

/** The hero types whose media the post shows as its featured image. */
const MEDIA_TYPES = new Set(['highImpact', 'mediumImpact', 'home'])

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
 * A post's opening, set like a magazine feature: the title leads on the
 * page's own ground, a byline strip states when and where it ran, and the
 * hero media sits below as the featured image, framed at its own proportions
 * and never cropped into a background. Without media the opening is only the
 * title and byline.
 */
export function PostHero({ post }: Props) {
  const { hero, title } = post
  const media =
    hero?.media && typeof hero.media === 'object' && hero.type && MEDIA_TYPES.has(hero.type)
      ? hero.media
      : null
  const facts = postFacts(post)

  return (
    <PostHeroRoot>
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
          <dl className="flex flex-wrap gap-x-12 gap-y-5 md:gap-x-16">
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

      {media && <FeaturedImage media={media} />}
    </PostHeroRoot>
  )
}

/** Wider than this, a picture runs the full column; a near miss of the edge reads as a mistake. */
const LANDSCAPE = 1.5

/**
 * The featured image at its own proportions. A landscape picture runs the
 * full column; a squarer one is held to what fits one screen under the
 * chrome, which leaves room for the caption beside it. Otherwise the caption
 * wraps below.
 */
function FeaturedImage({ media }: { media: MediaType }) {
  const ratio = frameRatio(media)
  const width =
    ratio >= LANDSCAPE
      ? '100%'
      : `min(100%, (100svh - var(--chrome-top) - var(--dock-clearance) - 3rem) * ${ratio})`
  return (
    <figure className="flex flex-wrap items-end gap-x-10 gap-y-4">
      <div
        className="relative flex-none overflow-clip bg-muted in-data-[arrival=load]:motion-safe:animate-hero-wipe in-data-[arrival=load]:motion-reduce:animate-hero-fade"
        data-hero-media=""
        data-slot="post-hero-media"
        style={{
          ...enterAt(BEAT.media),
          aspectRatio: ratio,
          width,
        }}
      >
        <Media
          fill
          imgClassName="object-cover in-data-[arrival=load]:motion-safe:animate-hero-settle"
          priority
          resource={media}
          size="(min-width: 48rem) 90vw, 100vw"
          videoClassName="object-cover in-data-[arrival=load]:motion-safe:animate-hero-settle"
        />
      </div>
      {media.caption && (
        <figcaption
          className={cn('max-w-[36ch] flex-1 basis-64 text-muted-foreground text-sm', enterIn)}
          style={enterAt(BEAT.caption)}
        >
          <RichText data={media.caption} enableGutter={false} enableProse={false} />
        </figcaption>
      )}
    </figure>
  )
}

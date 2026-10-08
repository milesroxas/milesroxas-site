'use client'

import { IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import { useId } from 'react'
import { Media } from '@/components/Media'
import { Visual } from '@/components/Visual'
import { resolveOpening } from '@/features/immersive/visual'
import { useCurtainLink } from '@/features/page-transition/use-curtain-link'
import type { Media as MediaType } from '@/payload-types'
import { cursorTarget } from '@/providers/Cursor/variants'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import type { MorePostsItem } from './query'

/** Fixed to UTC so the server and the visitor's browser print the same month. */
const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

/** The other posts step back while one is under the pointer. */
const POST_ITEM =
  'transition-opacity duration-400 ease-[ease] pointer-fine:group-has-[a:hover]/posts:[&:not(:hover)]:opacity-55 motion-reduce:transition-none'

/** The title's rule, drawn left to right along every line it wraps to. */
function Ink({ children }: { children: string }) {
  return (
    <span className="bg-[linear-gradient(currentColor,currentColor)] box-decoration-clone bg-no-repeat transition-[background-size] duration-700 ease-(--ease-out-quint) [background-position:0_100%] [background-size:0%_1px] motion-reduce:transition-none pointer-fine:group-hover/post:[background-size:100%_1px] group-focus-visible/post:[background-size:100%_1px]">
      {children}
    </span>
  )
}

function Byline({ item }: { item: MorePostsItem }) {
  const { publishedAt, source } = item
  if (!publishedAt && !source) return null
  return (
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-muted-foreground text-xs/none">
      {publishedAt && (
        <time className="tabular-nums" dateTime={publishedAt}>
          {monthFormat.format(new Date(publishedAt))}
        </time>
      )}
      {publishedAt && source && <span aria-hidden className="h-px w-5 bg-border" />}
      {source && <span>{source}</span>}
    </p>
  )
}

/**
 * A frame at the upload's own proportions, so nothing is cropped to fit the
 * layout; an effect's posters and uploads without stored dimensions frame at
 * 16:9. Extreme panoramas and tall portraits are held to 2.4:1 and 3:4.
 */
const frameRatio = (media: MediaType | null) =>
  media?.width && media.height ? Math.min(Math.max(media.width / media.height, 3 / 4), 2.4) : 16 / 9

const FRAME_SIZE = '(min-width: 64rem) 30vw, (min-width: 40rem) 10rem, 7rem'

/**
 * The post's picture as its opening shows it: the upload (or share image),
 * else the posters of the effect grounding the hero, one per theme. The reveal
 * wipes the frame open and owns its first child's transform, so the hover
 * scale sits one layer in.
 */
function Frame({ item }: { item: MorePostsItem }) {
  const { ground, media, surface } = resolveOpening(item.hero, {
    fallbackMedia: item.metaImage,
    seedKey: 'hero',
  })
  return (
    <div
      className="relative w-28 shrink-0 overflow-clip bg-muted sm:w-40 lg:w-full"
      data-reveal="media"
      style={{ aspectRatio: frameRatio(media) }}
    >
      <div className="absolute inset-0">
        <div className="relative size-full transition-[scale] duration-1200 ease-(--ease-out-quint) pointer-fine:group-hover/post:scale-[1.035] group-focus-visible/post:scale-[1.035] motion-reduce:transition-none">
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
            // A pinned face paints its own ground, as the opening does.
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
            <div className="size-full bg-foreground/5 ring-1 ring-border ring-inset" />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * One post. A compact row on small screens, its picture at the start; a
 * column from `lg`, picture over title. It opens behind the page curtain,
 * like a post card.
 */
function PostCard({ item }: { item: MorePostsItem }) {
  const href = `/posts/${item.slug}`
  const open = useCurtainLink(href, item.hero)
  return (
    <li className={POST_ITEM}>
      <article>
        {/* Each card is its own shell, so cards enter as they reach the line. */}
        <ScrollReveal as="div" variant="underMedia">
          <Link
            {...cursorTarget('view')}
            className="group/post flex items-start gap-4 rounded-sm outline-offset-8 focus-visible:outline-2 focus-visible:outline-ring sm:gap-6 lg:flex-col lg:gap-5"
            href={href}
            onClick={open}
          >
            <Frame item={item} />
            <div className="flex min-w-0 flex-col gap-2.5" data-reveal>
              <h3 className="text-pretty text-lg/snug lg:text-xl/snug">
                <Ink>{item.title}</Ink>
              </h3>
              <Byline item={item} />
            </div>
          </Link>
        </ScrollReveal>
      </article>
    </li>
  )
}

function AllPosts({ className }: { className?: string }) {
  return (
    <Link
      className={cn(
        'group/all inline-flex shrink-0 items-center gap-2 rounded-sm font-medium text-sm outline-offset-4 transition-transform duration-150 ease-(--ease-out-quint) focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none',
        className,
      )}
      href="/posts"
    >
      All posts
      <IconArrowRight
        aria-hidden
        className="size-4 transition-transform duration-400 ease-(--ease-out-quint) pointer-fine:group-hover/all:translate-x-0.5 group-focus-visible/all:translate-x-0.5 motion-reduce:transition-none"
        stroke={1.5}
      />
    </Link>
  )
}

/** Three posts to open next, at one size, under a quiet heading. */
export function MorePostsIndex({ items }: { items: MorePostsItem[] }) {
  const headingId = useId()
  return (
    <section
      aria-labelledby={headingId}
      className="bg-background px-gutter pt-24 pb-16 text-foreground md:pt-32 md:pb-24"
      data-slot="more-posts"
    >
      <ScrollReveal
        as="div"
        className="flex items-baseline justify-between gap-6 border-border border-b pb-5"
        variant="intro"
      >
        <h2 className="text-heading-2" data-reveal id={headingId}>
          More posts
        </h2>
        <div className="max-lg:hidden" data-reveal>
          <AllPosts />
        </div>
      </ScrollReveal>

      <ul className="group/posts grid gap-6 pt-8 md:pt-10 lg:grid-cols-3 lg:gap-x-12">
        {items.map((item) => (
          <PostCard item={item} key={item.id} />
        ))}
      </ul>

      <AllPosts className="mt-10 lg:hidden" />
    </section>
  )
}

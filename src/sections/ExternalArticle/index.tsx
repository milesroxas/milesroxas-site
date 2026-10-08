import { Section } from '@/blocks/shared/section'
import { cursorTarget } from '@/providers/Cursor/variants'
import type { ExternalArticle as ExternalArticleData } from '@/utilities/externalArticle'
import { cn } from '@/utilities/ui'
import { ExternalArticleReveal } from './ExternalArticle.client'

/** Tabler's arrow-up-right: drawn twice, the twin one box down-left, so a pass reads as a loop. */
const ARROW = 'M17 7l-10 10M8 7h9v9'

/**
 * The way out of an external post: after the intro says why the article is
 * worth reading, the band hands the reader to it. One link spans the band;
 * resting on it sends the arrow out of its box (its twin comes in behind)
 * and draws the rule between this site and the publisher's.
 * Referrer is kept so the publisher can see where readers come from.
 * The heading enters line by line; its lines hold a transform only while they
 * enter, so the link's band-wide hit area is back once they land.
 * `last` paints the band under the Footer's dock clearance, so the page ends
 * on it rather than on a strip of page ground.
 */
export function ExternalArticle({
  url,
  publisher,
  address,
  last = false,
}: ExternalArticleData & { last?: boolean }) {
  return (
    <Section
      className={cn(
        last &&
          '-mb-(--foot-height) pb-[calc(--spacing(32)+var(--foot-height))] md:pb-[calc(--spacing(48)+var(--foot-height))]',
      )}
      spacing="loose"
      theme="neutral"
    >
      <ExternalArticleReveal>
        <h2 className="text-balance text-display">
          <a
            {...cursorTarget('read')}
            className="after:absolute after:inset-0 after:rounded-sm focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring focus-visible:after:outline-offset-8"
            href={url}
            rel="noopener"
            target="_blank"
          >
            <span className="block text-muted-foreground transition-colors duration-400 ease-(--ease-out-quint) group-hover/out:text-foreground group-has-focus-visible/out:text-foreground">
              Read the full article on
            </span>{' '}
            <span>
              {/* The word joiner keeps the arrow on the publisher's last line. */}
              {`${publisher}⁠`}
              {/* The svg clips its own box; the group travels, the press only dips the box. */}
              <svg
                aria-hidden
                className="ml-[0.15em] inline-block size-[0.7em] align-[-0.02em] transition-[scale] duration-150 ease-(--ease-out-quint) group-active/out:scale-90 motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                viewBox="0 0 24 24"
              >
                <g className="transition-[translate] duration-500 ease-(--ease-out-quint) pointer-fine:group-hover/out:translate-x-full pointer-fine:group-hover/out:-translate-y-full group-has-focus-visible/out:translate-x-full group-has-focus-visible/out:-translate-y-full group-data-[arrival=pending]/out:-translate-x-full group-data-[arrival=pending]/out:translate-y-full group-data-[arrival=pending]/out:transition-none motion-reduce:transition-none">
                  <path d={ARROW} />
                  <path d={ARROW} transform="translate(-24 24)" />
                </g>
              </svg>
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h2>

        <div className="flex flex-col gap-4">
          <div aria-hidden className="relative h-px">
            <span className="absolute inset-0 origin-left bg-foreground/15 transition-transform duration-1000 ease-(--ease-out-quint) group-data-[arrival=pending]/out:scale-x-0 group-data-[arrival=pending]/out:transition-none motion-reduce:transition-none" />
            <span className="absolute inset-0 origin-left scale-x-0 bg-foreground transition-transform duration-1000 ease-(--ease-out-quint) group-hover/out:scale-x-100 group-has-focus-visible/out:scale-x-100 motion-reduce:transition-none" />
          </div>
          <p className="flex flex-col gap-1 text-muted-foreground text-sm md:flex-row md:items-baseline md:justify-between md:gap-6">
            <span className="break-all font-mono text-foreground">{address}</span>
            <span aria-hidden>Opens in a new tab</span>
          </p>
        </div>
      </ExternalArticleReveal>
    </Section>
  )
}

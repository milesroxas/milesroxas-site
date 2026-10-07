import { IconArrowUpRight } from '@tabler/icons-react'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { cursorTarget } from '@/providers/Cursor/variants'
import type { ExternalArticle as ExternalArticleData } from '@/utilities/externalArticle'

/**
 * The way out of an external post: after the intro says why the article is
 * worth reading, the band hands the reader to it. One link spans the band;
 * resting on it draws the rule between this site and the publisher's.
 * Referrer is kept so the publisher can see where readers come from.
 */
export function ExternalArticle({ url, publisher, address }: ExternalArticleData) {
  return (
    <Section spacing="loose" theme="neutral">
      <Container>
        <div className="group/out relative flex flex-col gap-10 md:gap-16">
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
                {`${publisher}\u2060`}
                <IconArrowUpRight
                  aria-hidden
                  className="ml-[0.15em] inline-block size-[0.7em] align-[-0.02em] transition-transform duration-400 ease-(--ease-out-quint) group-hover/out:translate-x-[0.08em] group-hover/out:-translate-y-[0.08em] group-has-focus-visible/out:translate-x-[0.08em] group-has-focus-visible/out:-translate-y-[0.08em]"
                  stroke={1.25}
                />
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h2>

          <div className="flex flex-col gap-4">
            <div aria-hidden className="relative h-px bg-foreground/15">
              <span className="absolute inset-0 origin-left scale-x-0 bg-foreground transition-transform duration-1000 ease-(--ease-out-quint) group-hover/out:scale-x-100 group-has-focus-visible/out:scale-x-100 motion-reduce:transition-none" />
            </div>
            <p className="flex flex-col gap-1 text-muted-foreground text-sm md:flex-row md:items-baseline md:justify-between md:gap-6">
              <span className="break-all font-mono text-foreground">{address}</span>
              <span aria-hidden>Opens in a new tab</span>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}

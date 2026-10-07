import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { WorkIntro as WorkIntroData } from '@/payload-types'
import { IntroStatement } from './Statement.client'

type Props = {
  /** Names the band for assistive tech; not shown (Paper, "Work Intro"). */
  title?: WorkIntroData['title']
  /** The authored introduction copy; wins over `summary`. */
  body?: WorkIntroData['body']
  /** Canonical summary from the Content Hub. Blank lines split paragraphs. */
  summary?: string | null
}

/**
 * The introduction band after the hero of a Work or Post (Paper, "Work
 * Intro"): one statement on five composition columns. The eyebrow is hidden
 * and the title screen-reader only, both kept in the CMS for later.
 *
 * The top is trimmed against the hero's own 6rem foot so the statement sits
 * as far from the hero as from the next normal band. The band is one screen
 * less those outer gaps, so centred, the statement is all that shows.
 */
export const WorkIntro: React.FC<Props> = ({ title, body, summary }) => (
  <Section className="flex min-h-[calc(100svh-10rem)] flex-col justify-center pt-8 md:min-h-[calc(100svh-12rem)] md:pt-24">
    <Container>
      {title ? <h2 className="sr-only">{title}</h2> : null}
      <BlockGrid>
        <IntroStatement className="text-heading-2/snug tracking-normal md:col-span-6 lg:col-span-5 [&_p+p]:mt-6">
          {body ? (
            <RichText data={body} enableGutter={false} enableProse={false} />
          ) : (
            summary
              ?.split(/\n\s*\n/)
              .map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
          )}
        </IntroStatement>
      </BlockGrid>
    </Container>
  </Section>
)

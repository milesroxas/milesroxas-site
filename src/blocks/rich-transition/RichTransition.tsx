import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { RichTransitionBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'
import {
  eyebrowClassName,
  type ProseHeadingLevel,
  proseHeadingClassNames,
  typeScale,
} from '../shared/typography'

/**
 * Copy fields shared by the generic and case-study rich-transition blocks.
 * `blockType` differs per collection, so it is not part of this shape.
 *
 * Anchored on the generic block because it carries exactly these
 * presentational fields: the work-page variant adds a canonical-content picker
 * and relaxes `heading`, which its renderer resolves before it reaches this
 * component.
 */
export type RichTransitionFields = Pick<
  RichTransitionBlock,
  'body' | 'eyebrow' | 'heading' | 'headingLevel' | 'layout' | 'textSize' | 'theme'
>

type Layout = NonNullable<RichTransitionFields['layout']>

/**
 * `stacked` is a render flag, not a CMS field: it says the block sits in a
 * Section block's stack, which owns the gap below it (see `Prose`).
 */
type LayoutProps = RichTransitionFields & { stacked?: boolean }

const Body = ({ className, data }: { className?: string; data: DefaultTypedEditorState }) => (
  <div data-reveal>
    <RichText className={className} data={data} enableGutter={false} enableProse={false} />
  </div>
)

const Eyebrow = ({ text }: { text?: string | null }) =>
  text ? (
    <p className={eyebrowClassName} data-reveal data-reveal-group="heading">
      {text}
    </p>
  ) : null

/** Heading cluster over the body on the composition grid; each layout picks the columns. */
const gridLayout =
  (headingColumns: string, bodyColumns: string) =>
  ({ body, eyebrow, heading, textSize }: LayoutProps) => {
    const type = typeScale(textSize)
    return (
      <Container>
        <BlockGrid>
          <div className={cn('text-stack', headingColumns)}>
            <Eyebrow text={eyebrow} />
            <h2 className={type.title} data-reveal data-reveal-group="heading">
              {heading}
            </h2>
          </div>
          {body ? (
            <div className={bodyColumns}>
              <Body className={type.lead} data={body} />
            </div>
          ) : null}
        </BlockGrid>
      </Container>
    )
  }

/** Offset: cluster one column in (2-5), body on a narrower measure under it (2-4). The default. */
const Offset = gridLayout('md:col-span-4 md:col-start-2', 'md:col-span-3 md:col-start-2')

/** Left: Offset flush with the page column (1-4, body 1-3). */
const Left = gridLayout('md:col-span-4', 'md:col-span-3')

/** Split: cluster in columns 1-4, body across the gap in columns 6-8. */
const Split = gridLayout('md:col-span-4', 'md:col-span-3 md:col-start-6')

/**
 * Centered: heading on a 768px measure over a 640px reading column, stacked
 * and centered on the band. Matches the Paper centered frame (1024px cluster,
 * body at `w-narrow`).
 */
const Centered = ({ body, eyebrow, heading, textSize }: LayoutProps) => {
  const type = typeScale(textSize)
  return (
    <Container>
      <div className="text-stack mx-auto max-w-5xl text-center">
        <Eyebrow text={eyebrow} />
        <h2 className={cn(type.title, 'mx-auto max-w-3xl')} data-reveal data-reveal-group="heading">
          {heading}
        </h2>
        {body ? <Body className={cn(type.lead, 'mx-auto max-w-160')} data={body} /> : null}
      </div>
    </Container>
  )
}

/** Statement: display-sized heading, body as a short caption underneath. */
const Statement = ({ body, eyebrow, heading }: LayoutProps) => (
  <Container>
    <div className="text-stack mx-auto max-w-5xl text-center">
      <Eyebrow text={eyebrow} />
      <h2 className="text-display" data-reveal data-reveal-group="heading">
        {heading}
      </h2>
      {body ? <Body className="mx-auto max-w-xl text-lg" data={body} /> : null}
    </div>
  </Container>
)

/**
 * Prose heading sizes come from the shared prose scale
 * (`proseHeadingClassNames`), the same one a Story beats heading uses, so an
 * opener and the beats under it never drift apart.
 *
 * The deck steps with the heading: 18px under an h2 is a standfirst from
 * `md` (16px on a phone, where the h2 is only 20px), body size under the
 * lower two, all on the body's 28px line so the deck and the beats below it
 * share a baseline.
 */
const proseBodyClasses: Record<ProseHeadingLevel, string> = {
  h2: 'text-base/7 md:text-lg/7',
  h3: 'text-base/7',
  h4: 'text-base/7',
}

/**
 * A prose opener binds to the passage it opens, so the gap below it is two
 * body lines (40px, 56px from `md`) rather than a full step of rhythm.
 *
 * Who sets it depends on what the block is standing in, because only one of
 * the two shells can state the gap honestly:
 *
 * - In a Section (`stacked`), the Section's stack owns every gap between its
 *   children and the block cannot see which step the editor chose, so the
 *   exception lives with the stack: `stack-binds-opener` in globals.css,
 *   applied by `SectionBand`, keyed on the `data-prose-opener` marker below.
 *   The block adds nothing, or the two would stack up.
 * - In its own band, the gap below is the next band's top step. Nothing can
 *   restyle that block, so this one cancels the step it knows every text
 *   block carries (`normal`, SPACING_SCALE) and restates its own: padding
 *   first, then a negative margin of exactly the cancelled step.
 *
 * Both classes sit on the block's own root rather than the `Section`, because
 * a Prose heading in a Section renders `bare` and has no band to carry them.
 */
const proseBandBottomClassName = 'pb-10 -mb-16 md:pb-14 md:-mb-24'

/**
 * Prose: the whole cluster (eyebrow, heading, deck) on the Story beats
 * reading column (columns 3-6), so a Standard heading can open a passage of
 * beats without the copy stepping sideways between blocks.
 *
 * One cell, not two: `text-stack` owns eyebrow to heading to deck in the
 * heading's own em, which keeps the cluster proportional at every level. The
 * two-cell version took the grid's fixed 32px row gap between heading and
 * deck, which outgrew an h4 and crowded an h2.
 */
const Prose = ({ body, eyebrow, heading, headingLevel, stacked }: LayoutProps) => {
  const level = headingLevel || 'h2'
  const Heading = level
  return (
    <Container className={stacked ? undefined : proseBandBottomClassName}>
      <BlockGrid data-prose-opener>
        <div className="text-stack md:col-span-4 md:col-start-3">
          <Eyebrow text={eyebrow} />
          <Heading
            className={proseHeadingClassNames[level]}
            data-reveal
            data-reveal-group="heading"
          >
            {heading}
          </Heading>
          {body ? <Body className={proseBodyClasses[level]} data={body} /> : null}
        </div>
      </BlockGrid>
    </Container>
  )
}

const layouts: Record<Layout, (props: LayoutProps) => ReactNode> = {
  offset: Offset,
  left: Left,
  centered: Centered,
  split: Split,
  statement: Statement,
  prose: Prose,
}

/**
 * Presentational rich-transition: eyebrow, heading, and optional body on a
 * themed band, arranged by `layout`. Collection-agnostic: the generic Standard
 * block and the case-study variant share this shape.
 *
 * The band drops its bottom padding so the block runs straight into whatever
 * follows; only the top of the band carries rhythm.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a reveal band). The `data-reveal`
 * markers are inert unless such a shell animates them.
 *
 * Eyebrow and heading share a `data-reveal-group`, so the entrance is two
 * beats — the cluster, then the body — not three. An interstitial is one
 * thought arriving; staggering a kicker ahead of the heading it labels makes
 * the smallest element the loudest motion in the block and visibly detaches it
 * from that heading. Markers stay on the elements rather than a wrapper
 * because `text-stack` spaces the cluster through direct-child selectors.
 */
export const RichTransition = ({
  bare = false,
  stacked = false,
  ...block
}: RichTransitionFields & { bare?: boolean; stacked?: boolean }) => {
  const Layout = layouts[block.layout ?? 'centered']
  const inner = <Layout {...block} stacked={stacked} />
  if (bare) return inner
  return (
    <Section className="pb-0 md:pb-0" theme={block.theme}>
      {inner}
    </Section>
  )
}

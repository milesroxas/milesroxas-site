import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { imageMedia, paragraph, richText, text } from '@/stories/fixtures'
import { BAND_THEME_OPTIONS, type BandTheme } from './band-theme'
import { BlockGrid } from './grid'
import { Section, SPACING_SCALE, STACK_SPACING } from './section'
import { eyebrowClassName } from './typography'

/*
 * The composition band (`Section`) with the two site reveals inside it, as
 * the run blocks will compose them (docs/composer-roadmap.md, Phase 1).
 * Placeholder children stand in for the blocks, which land in Phase 3; the
 * reveal markers and tuning are the ported ones, unchanged.
 */

const body = richText(
  paragraph(
    text(
      'A band owns its surface and its vertical rhythm, nothing else. Blocks inside it keep their own reveal, so a block moves the same inside a Section as at the top level.',
    ),
  ),
)

/** Copy cluster on the shared `intro` reveal: eyebrow, heading and body drop in. */
const IntroCopy = ({ heading }: { heading: string }) => (
  <ScrollReveal as="div" variant="intro">
    <Container>
      <BlockGrid>
        <div className="text-stack md:col-span-5">
          <p className={eyebrowClassName} data-reveal="" data-reveal-group="heading">
            Approach
          </p>
          <h2 className="text-heading-2" data-reveal="" data-reveal-group="heading">
            {heading}
          </h2>
          <div data-reveal="">
            <RichText data={body} enableGutter={false} enableProse={false} />
          </div>
        </div>
      </BlockGrid>
    </Container>
  </ScrollReveal>
)

/** Media under copy on the `underMedia` reveal: the frame mask-wipes open. */
const MediaUnderCopy = () => (
  <ScrollReveal as="div" variant="underMedia">
    <Container>
      <BlockGrid>
        <div className="text-stack md:col-span-4" data-reveal="">
          <h3 className="text-heading-3">Stacked media</h3>
        </div>
        <div
          className="relative aspect-16/9 overflow-hidden bg-muted md:col-span-8"
          data-reveal="media"
        >
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={imageMedia}
            size="100vw"
          />
        </div>
      </BlockGrid>
    </Container>
  </ScrollReveal>
)

/** A block without markers takes the CSS block reveal instead. */
const CssRevealBlock = () => (
  <RevealSection>
    <Container>
      <BlockGrid>
        <p className="text-lead md:col-span-6 md:col-start-3">
          A block with no reveal markers fades up as one piece.
        </p>
      </BlockGrid>
    </Container>
  </RevealSection>
)

type BandArgs = {
  spacing: keyof typeof SPACING_SCALE
  theme: BandTheme
}

const Band = ({ spacing, theme }: BandArgs) => (
  <Section spacing={spacing} theme={theme}>
    <div className={STACK_SPACING[spacing]}>
      <IntroCopy heading="One band, many blocks" />
      <MediaUnderCopy />
      <CssRevealBlock />
    </div>
  </Section>
)

const meta = {
  title: 'Foundation/Section band',
  component: Band,
  parameters: { layout: 'fullscreen' },
  args: { spacing: 'normal', theme: 'default' },
  argTypes: {
    spacing: { control: 'inline-radio', options: Object.keys(SPACING_SCALE) },
    theme: { control: 'inline-radio', options: BAND_THEME_OPTIONS.map(({ value }) => value) },
  },
} satisfies Meta<typeof Band>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Inverted: Story = { args: { theme: 'inverted' } }

export const Neutral: Story = { args: { theme: 'neutral' } }

export const Brand: Story = { args: { theme: 'brand' } }

export const Tight: Story = { args: { spacing: 'tight' } }

export const Loose: Story = { args: { spacing: 'loose', theme: 'inverted' } }

/** All four surfaces stacked, the way adjacent bands meet on a page. */
export const AllBands: Story = {
  render: (args) => (
    <>
      {BAND_THEME_OPTIONS.map(({ value: theme }) => (
        <Band key={theme} spacing={args.spacing} theme={theme} />
      ))}
    </>
  ),
}

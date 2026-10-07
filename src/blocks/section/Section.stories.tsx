import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FullMediaBlock } from '@/blocks/full-media/Component'
import { RichTextBlock } from '@/blocks/rich-text/Component'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { mediaFixture, paragraph, richText, text } from '@/stories/fixtures'
import { SectionBand } from './SectionBand'

const body = richText(
  paragraph(
    text(
      'A composition band holds a run of blocks on one surface, so the page reads as one argument rather than a stack of parts.',
    ),
  ),
)

/**
 * Children of a Section always render `bare`: the band (surface + vertical
 * rhythm) is painted once by `SectionBand`, and the internal stack owns the
 * gap between blocks, exactly how the renderers compose nested blocks.
 */
const children = (
  <>
    <FullMediaBlock
      bare
      blockType="fullMedia"
      eyebrow="Approach"
      heading="One band, many blocks"
      body={body}
      media={mediaFixture}
      width="contained"
      aspectRatio="16-9"
      contentPosition="left"
    />
    <SplitContentNarrowBlock
      bare
      blockType="splitContentNarrow"
      eyebrow="About"
      heading="Nested beneath the same surface"
      body={body}
      media={mediaFixture}
      imagePosition="right"
    />
  </>
)

/**
 * A section heading titles the section under it, so it sits half a stack
 * step above the next block rather than a full one (`STACK_OPENER`).
 */
const opensWithProseHeading = (
  <>
    <RichTransition
      bare
      body={body}
      eyebrow="Approach"
      heading="One band, many blocks"
      layout="prose"
    />
    <RichTextBlock bare blockType="richText" body={body} />
    <SplitContentNarrowBlock
      bare
      blockType="splitContentNarrow"
      eyebrow="About"
      heading="Nested beneath the same surface"
      body={body}
      media={mediaFixture}
      imagePosition="right"
    />
  </>
)

const meta = {
  title: 'Blocks/Section',
  component: SectionBand,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children,
  },
} satisfies Meta<typeof SectionBand>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Neutral: Story = {
  args: { customize: true, theme: 'neutral' },
}

export const Brand: Story = {
  args: { customize: true, theme: 'brand' },
}

export const Inverted: Story = {
  args: { customize: true, theme: 'inverted' },
}

export const TightSpacing: Story = {
  args: { customize: true, spacing: 'tight' },
}

export const LooseSpacing: Story = {
  args: { customize: true, spacing: 'loose' },
}

export const TightStack: Story = {
  args: { customize: true, stack: 'tight' },
}

export const LooseStack: Story = {
  args: { customize: true, stack: 'loose' },
}

export const OpensWithProseHeading: Story = {
  args: { children: opensWithProseHeading },
}

/** Unchecking Customize must ignore whatever the hidden fields still store. */
export const CustomizeOffIgnoresStoredValues: Story = {
  args: { customize: false, theme: 'inverted', spacing: 'none', stack: 'none' },
}

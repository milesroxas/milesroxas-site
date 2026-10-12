import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { paragraph, richText, TEXT_FORMAT_BOLD, text } from '@/stories/fixtures'
import { CallOutBlock } from './Component'

const controls = blockControls<typeof CallOutBlock>('callout')

/**
 * One statement set large on the page, not on a painted band. It plays its
 * own intro reveal, gated later than the shared line, and a veil fades the
 * copy out under the dock as it scrolls away.
 */
const meta = {
  title: 'Blocks/Statements/CallOut',
  component: CallOutBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'callout',
    richText: richText(
      paragraph(
        text(
          'I design and build websites for brands that want their site to feel as considered as their product.',
        ),
      ),
    ),
  },
} satisfies Meta<typeof CallOutBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithEmphasis: Story = {
  args: {
    richText: richText(
      paragraph(
        text('Strategy, design and engineering in '),
        text('one pair of hands', TEXT_FORMAT_BOLD),
        text(', so nothing is lost between the deck and the build.'),
      ),
    ),
  },
}

/** Two short lines: each paragraph keeps the balanced, centred measure. */
export const TwoParagraphs: Story = {
  args: {
    richText: richText(
      paragraph(text('Clear in the room.')),
      paragraph(text('Unclear online. That is the gap the work closes.')),
    ),
  },
}

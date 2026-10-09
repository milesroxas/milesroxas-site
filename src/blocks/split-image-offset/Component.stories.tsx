import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { mediaFixture, paragraph, richText, text } from '@/stories/fixtures'
import { SplitImageOffsetBlock } from './Component'

const body = richText(
  paragraph(
    text('We connected solutions to the relevant products, services, languages, and industries.'),
  ),
)

const controls = blockControls<typeof SplitImageOffsetBlock>('splitImageOffset')

const meta = {
  title: 'Blocks/MediaAndContent/PairOffset',
  component: SplitImageOffsetBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'splitImageOffset',
    heading: 'Make the relationships visible',
    body,
    largeMedia: mediaFixture,
    smallMedia: mediaFixture,
    captionPosition: 'right',
  },
} satisfies Meta<typeof SplitImageOffsetBlock>

export default meta

type Story = StoryObj<typeof meta>

export const CaptionRight: Story = {}

export const CaptionLeft: Story = {
  args: { captionPosition: 'left' },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

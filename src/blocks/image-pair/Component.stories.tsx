import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { mediaFixture, paragraph, richText, text } from '@/stories/fixtures'
import { ImagePairBlock } from './Component'

const body = richText(
  paragraph(
    text('We connected solutions to the relevant products, services, languages, and industries.'),
  ),
)

const controls = blockControls<typeof ImagePairBlock>('imagePair')

const meta = {
  title: 'Blocks/MediaAndContent/Pair',
  component: ImagePairBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'imagePair',
    heading: 'Make the relationships visible',
    body,
    portraitMedia: mediaFixture,
    landscapeMedia: mediaFixture,
  },
} satisfies Meta<typeof ImagePairBlock>

export default meta

type Story = StoryObj<typeof meta>

export const PortraitLeft: Story = {}

export const PortraitRight: Story = {
  args: { portraitPosition: 'right' },
}

export const TextUnderLandscape: Story = {
  args: { textPosition: 'under-landscape' },
}

export const PortraitRightTextUnderLandscape: Story = {
  args: { portraitPosition: 'right', textPosition: 'under-landscape' },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

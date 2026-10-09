import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { blockControls } from '@/stories/block-controls'
import { mediaFixture, videoFixture } from '@/stories/fixtures'
import { FeatureImageStatementBlock } from './Component'

const controls = blockControls<typeof FeatureImageStatementBlock>('featureImageStatement')

const meta = {
  title: 'Blocks/Media/Statement',
  component: FeatureImageStatementBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'featureImageStatement',
    media: mediaFixture,
    caption: richTextFixture(
      'Strong B2B branding does not remove the deeper information. It places that information in an order people can understand.',
    ),
  },
} satisfies Meta<typeof FeatureImageStatementBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

export const TextLeft: Story = {
  args: { textPosition: 'left' },
}

export const LargeText: Story = {
  args: { textSize: 'large' },
}

export const FullBleed: Story = {
  args: { imageWidth: 'full' },
  parameters: { layout: 'fullscreen' },
}

export const AspectSixteenNine: Story = {
  args: { aspectRatio: '16-9' },
}

export const AspectThreeTwo: Story = {
  args: { aspectRatio: '3-2' },
}

export const AspectTwentyOneNine: Story = {
  args: { aspectRatio: '21-9' },
}

export const FullBleedSixteenNine: Story = {
  args: { imageWidth: 'full', aspectRatio: '16-9' },
  parameters: { layout: 'fullscreen' },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}

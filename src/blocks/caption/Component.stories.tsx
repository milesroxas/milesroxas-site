import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { mediaFixture, videoFixture } from '@/stories/fixtures'
import { CaptionBlock } from './Component'

const controls = blockControls<typeof CaptionBlock>('caption')

const meta = {
  title: 'Blocks/Media/Caption',
  component: CaptionBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'caption',
    media: mediaFixture,
  },
} satisfies Meta<typeof CaptionBlock>

export default meta

type Story = StoryObj<typeof meta>

export const WithCaption: Story = {}

export const Video: Story = {
  args: {
    media: videoFixture,
  },
}

export const WithoutCaption: Story = {
  args: {
    media: { ...mediaFixture, caption: null },
  },
}

export const WithoutGutter: Story = {
  args: {
    enableGutter: false,
  },
}

export const FullWidth: Story = {
  args: {
    size: 'full',
  },
}

export const Inset: Story = {
  args: {
    size: 'inset',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}

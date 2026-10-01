import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { imageMedia, paragraphRichText } from '@/stories/fixtures'
import { MediaBlock } from './Component'

const meta = {
  title: 'Blocks/MediaBlock',
  component: MediaBlock,
  tags: ['autodocs'],
  args: {
    blockType: 'mediaBlock',
    media: imageMedia,
    aspectRatio: 'landscape',
    theme: 'default',
  },
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['landscape', 'square', 'portrait', 'original'],
    },
    theme: {
      control: 'select',
      options: ['default', 'inverted', 'neutral', 'brand'],
    },
    captionLayout: {
      control: 'select',
      options: ['center', 'left', 'right', 'split-left', 'split-right'],
    },
    blockType: { table: { disable: true } },
  },
} satisfies Meta<typeof MediaBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape: Story = {}

export const Square: Story = {
  args: { aspectRatio: 'square' },
}

export const FullWidth: Story = {
  args: { fullWidth: true },
}

export const WithCaption: Story = {
  args: {
    showCaption: true,
    captionLayout: 'center',
    richText: paragraphRichText,
  },
}

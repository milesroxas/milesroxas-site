import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { YouTubeBlock } from './Component'

const meta = {
  title: 'Blocks/YouTube',
  component: YouTubeBlock,
  tags: ['autodocs'],
  args: {
    blockType: 'youTube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    aspectRatio: 'landscape',
  },
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['landscape', 'square', 'portrait'],
    },
    blockType: { table: { disable: true } },
  },
} satisfies Meta<typeof YouTubeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape: Story = {}

export const Portrait: Story = {
  args: { aspectRatio: 'portrait' },
}

export const InvalidUrl: Story = {
  args: { url: 'https://example.com/not-a-video' },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { paragraphRichText } from '@/stories/fixtures'
import { BannerBlock } from './Component'

// A Rich text body block, not a layout block, so it has no `blockControls` manifest entry.
const meta = {
  title: 'Blocks/Text/Banner',
  component: BannerBlock,
  tags: ['autodocs'],
  args: {
    blockType: 'banner',
    content: paragraphRichText,
    style: 'info',
  },
  argTypes: {
    style: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
    blockType: { table: { disable: true } },
  },
} satisfies Meta<typeof BannerBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {}

export const Warning: Story = {
  args: { style: 'warning' },
}

export const ErrorStyle: Story = {
  name: 'Error',
  args: { style: 'error' },
}

export const Success: Story = {
  args: { style: 'success' },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { imageMedia } from '@/stories/fixtures'
import { Media } from './index'

const meta = {
  title: 'Components/Media',
  component: Media,
  tags: ['autodocs'],
} satisfies Meta<typeof Media>

export default meta
type Story = StoryObj<typeof meta>

export const Image: Story = {
  args: {
    resource: imageMedia,
  },
  render: (args) => (
    <div className="w-xl">
      <Media {...args} />
    </div>
  ),
}

export const ImageFill: Story = {
  args: {
    fill: true,
    resource: imageMedia,
  },
  render: (args) => (
    <div className="relative aspect-video w-xl overflow-hidden rounded-md">
      <Media {...args} className="h-full w-full object-cover" />
    </div>
  ),
}

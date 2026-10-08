import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { externalPostCardData, postCardData } from '@/stories/fixtures'
import { PostCard } from './Component'

const meta = {
  title: 'Components/PostCard',
  component: PostCard,
  tags: ['autodocs'],
  parameters: {
    // Clicking the card opens the post behind the page curtain, which needs
    // the live app shell; stories are render-only.
    docs: {
      description: {
        component:
          'Post listing card. The click-driven page transition (curtain + router) is not exercised in Storybook.',
      },
    },
  },
  args: {
    doc: postCardData,
  },
  argTypes: {
    aspect: {
      control: 'select',
      options: ['wide', 'portrait', 'square'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const External: Story = {
  args: { doc: externalPostCardData },
}

export const Portrait: Story = {
  args: { aspect: 'portrait' },
}

export const Square: Story = {
  args: { aspect: 'square' },
}

export const TitleOverride: Story = {
  args: { title: 'Custom title from props' },
}

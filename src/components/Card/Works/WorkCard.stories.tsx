import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { workCardData } from '@/stories/fixtures'
import { WorkCard } from './Component'

const meta = {
  title: 'Components/WorkCard',
  component: WorkCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Work listing card. The click-driven page transition (GSAP Flip + router) is not exercised in Storybook.',
      },
    },
  },
  args: {
    doc: workCardData,
  },
  argTypes: {
    aspect: {
      control: 'select',
      options: ['wide', 'portrait', 'square'],
    },
    imageRef: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDescription: Story = {
  args: { showDescription: true },
}

export const Portrait: Story = {
  args: { aspect: 'portrait' },
}

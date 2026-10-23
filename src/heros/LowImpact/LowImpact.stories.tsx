import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { simpleRichText } from '@/stories/fixtures'
import { LowImpactHero } from './index'

const meta = {
  title: 'Heroes/LowImpact',
  component: LowImpactHero,
  tags: ['autodocs'],
} satisfies Meta<typeof LowImpactHero>

export default meta
type Story = StoryObj<typeof meta>

export const WithRichText: Story = {
  args: {
    type: 'lowImpact',
    richText: simpleRichText,
  },
}

export const WithChildren: Story = {
  args: {
    children: <h1 className="text-4xl font-light">A hero title passed as children</h1>,
  },
}

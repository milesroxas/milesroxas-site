import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { pageHero } from '@/stories/fixtures'
import { MediumImpactHero } from './index'

const meta = {
  title: 'Heros/MediumImpact',
  component: MediumImpactHero,
  tags: ['autodocs'],
  args: pageHero,
} satisfies Meta<typeof MediumImpactHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutLinks: Story = {
  args: { links: [] },
}

export const WithoutMedia: Story = {
  args: { media: null },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { pageHero } from '@/stories/fixtures'
import { FieldHero } from './index'

const meta = {
  title: 'Heroes/Field',
  component: FieldHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The aim field grounds the whole band under a lowercase statement; the rule at its foot reads what the reticle is locked on. Move the pointer over the copy and click to fire a ripple.',
      },
    },
  },
  args: { ...pageHero, type: 'field', media: null },
} satisfies Meta<typeof FieldHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutLinks: Story = {
  args: { links: [] },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { pageHero } from '@/stories/fixtures'
import { InstrumentHero } from './index'

const meta = {
  title: 'Heroes/Instrument',
  component: InstrumentHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Flat paper opening; the aim field runs in one ink panel beside the copy, with a fluoro readout of the cell under the reticle.',
      },
    },
  },
  args: { ...pageHero, type: 'instrument', media: null },
} satisfies Meta<typeof InstrumentHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutLinks: Story = {
  args: { links: [] },
}

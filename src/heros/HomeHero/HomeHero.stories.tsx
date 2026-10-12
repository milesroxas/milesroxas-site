import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { imageMedia, videoFixture } from '@/stories/fixtures'
import { HomeHero } from './index'

const meta = {
  title: 'Heroes/HomeHero',
  component: HomeHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // CSS drives the load-in; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
    docs: {
      description: {
        component:
          'The home opening: the portrait wipes open between two marquee strips of roles and skills, which rise word by word and then drift in opposite directions. The whole load-in is CSS, from the server markup.',
      },
    },
  },
  args: {
    type: 'home',
    media: imageMedia,
  },
} satisfies Meta<typeof HomeHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { imageMedia, videoFixture } from '@/stories/fixtures'
import { HighImpactHero } from './index'

const meta = {
  title: 'Heroes/HighImpact',
  component: HighImpactHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-bleed band of media, in the dark palette unless an effect pins another. With an effect, the effect grounds the band and the media blends over it.',
      },
    },
  },
  args: {
    type: 'highImpact',
    media: imageMedia,
  },
} satisfies Meta<typeof HighImpactHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

/** The effect alone grounds the band. */
export const StreakField: Story = {
  args: {
    media: null,
    visualType: 'streakField',
    shader: { preset: 'depth-map-v1', seed: 42 },
  },
}

/** The media soft-lights over the effect. */
export const StreakFieldWithMedia: Story = {
  args: {
    visualType: 'streakField',
    shader: { preset: 'depth-map-v1', seed: 42 },
  },
}

/** Pinned light: the band takes the light palette instead of the dark default. */
export const PinnedLight: Story = {
  args: {
    media: null,
    visualType: 'streakField',
    shader: { preset: 'topography-v1', seed: 12, surface: 'light' },
  },
}

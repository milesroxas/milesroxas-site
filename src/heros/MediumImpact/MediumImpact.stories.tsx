import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mediaFixture, pageHero } from '@/stories/fixtures'
import { MediumImpactHero } from './index'

const meta = {
  title: 'Heroes/MediumImpact',
  component: MediumImpactHero,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Copy and links over the media. An effect chosen on the hero grounds the whole band behind both (`HeroGround`); a face pinned on the effect paints the band in that palette.',
      },
    },
  },
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

export const WithCaption: Story = {
  args: { media: mediaFixture },
}

/** A Streak Field grounds the band behind the copy and the media alike. */
export const StreakField: Story = {
  args: {
    visualType: 'streakField',
    shader: { preset: 'topography-v1', seed: 12 },
  },
}

/** A light leak washing across the band. */
export const LightLeak: Story = {
  args: {
    visualType: 'lightLeak',
    shader: { preset: 'amber-v1' },
  },
}

/** Pinned dark: the band paints the dark palette whatever the visitor's theme. */
export const PinnedDark: Story = {
  args: {
    media: null,
    visualType: 'streakField',
    shader: { preset: 'signal-v1', seed: 5, surface: 'dark' },
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { imageMedia } from '@/stories/fixtures'
import { WorkHero } from './index'

const meta = {
  title: 'Heroes/WorkHero',
  component: WorkHero,
  parameters: {
    layout: 'fullscreen',
    // CSS drives the load-in; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  args: {
    slug: 'brand-expansion-through-narrative',
    title: 'Making high-integrity software easier to understand',
    client: {
      id: 1,
      title: 'Adacore',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    industry: 'Enterprise Technology',
    role: 'Lead Design / Development',
    capabilities: ['Brand Expansion', 'Brand Communications', 'Website'].map((title, i) => ({
      id: i + 1,
      title,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })),
    hero: { media: imageMedia },
  },
} satisfies Meta<typeof WorkHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutClient: Story = {
  args: { client: null, role: null },
}

export const WithoutMedia: Story = {
  args: { hero: { media: null } },
}

export const TitleOnly: Story = {
  args: { client: null, industry: null, role: null, capabilities: null, hero: undefined },
}

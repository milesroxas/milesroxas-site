import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { imageMedia, paragraphRichText } from '@/stories/fixtures'
import { PostHero } from './index'

const meta = {
  title: 'Heroes/PostHero',
  component: PostHero,
  parameters: {
    layout: 'fullscreen',
    // CSS drives the load-in; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  args: {
    post: {
      title: 'Building Credibility Through Design and Content',
      source: 'internal',
      publishedAt: '2025-05-27T21:52:48.040Z',
      populatedAuthors: [{ id: '1', name: 'Miles Roxas' }],
      categories: [
        {
          id: 1,
          title: 'Strategy',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      hero: { type: 'editorial', media: imageMedia },
    },
  },
} satisfies Meta<typeof PostHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A squarer picture keeps to the frame cap, its caption under it. */
export const SquareWithCaption: Story = {
  args: {
    post: {
      ...meta.args.post,
      hero: {
        type: 'editorial',
        media: { ...imageMedia, width: 1200, height: 1000, caption: paragraphRichText },
      },
    },
  },
}

export const WithoutMedia: Story = {
  args: { post: { ...meta.args.post, hero: { type: 'editorial', media: null } } },
}

export const External: Story = {
  args: {
    post: {
      ...meta.args.post,
      categories: [],
      hero: { type: 'editorial' },
      source: 'external',
      external: {
        url: 'https://suitsandsandals.com/lab/shader-studio',
        publisher: 'Suits & Sandals',
      },
    },
  },
}

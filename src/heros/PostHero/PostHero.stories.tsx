import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { imageMedia, paragraphRichText } from '@/stories/fixtures'
import { PostHero } from './index'

const meta = {
  title: 'Heroes/PostHero',
  component: PostHero,
  parameters: {
    layout: 'fullscreen',
    // CSS drives the load-in; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
    docs: {
      description: {
        component:
          'The Editorial opening of a post. It always plays its own CSS load-in: a post card opens the post behind the page curtain (`src/features/page-transition`), which holds that load-in until the page is ready and then lifts, so the hero arrives exactly as it does here.',
      },
    },
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const label of ['Published', 'By', 'Filed under']) {
      await expect(canvas.getByText(label)).toBeInTheDocument()
    }
    await expect(canvas.getByText('May 27, 2025')).toBeInTheDocument()
  },
}

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

/** A Streak Field grounds the band behind the copy and the picture alike. */
export const StreakField: Story = {
  args: {
    post: {
      ...meta.args.post,
      hero: {
        type: 'editorial',
        media: imageMedia,
        visualType: 'streakField',
        shader: { preset: 'depth-map-v1', seed: 42, pointerInteraction: true },
      },
    },
  },
}

/** The effect alone: no picture, the field is the opening's only art. */
export const StreakFieldWithoutMedia: Story = {
  args: {
    post: {
      ...meta.args.post,
      hero: {
        type: 'editorial',
        media: null,
        visualType: 'streakField',
        shader: { preset: 'topography-v1', seed: 12 },
      },
    },
  },
}

/** Pinned dark: the band paints the dark palette whatever the visitor's theme. */
export const PinnedDark: Story = {
  args: {
    post: {
      ...meta.args.post,
      hero: {
        type: 'editorial',
        media: imageMedia,
        visualType: 'streakField',
        shader: { preset: 'signal-v1', seed: 5, surface: 'dark' },
      },
    },
  },
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

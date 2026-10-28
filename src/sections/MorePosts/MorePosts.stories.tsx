import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { imageMedia } from '@/stories/fixtures'
import { MorePostsIndex } from './MorePosts.client'
import type { MorePostsItem } from './query'

const items: MorePostsItem[] = [
  {
    id: 1,
    slug: 'designing-with-motion',
    title: 'Designing with Motion',
    description: 'Where to draw the line between delight and distraction.',
    publishedAt: '2026-09-14T12:00:00.000Z',
    source: 'Design',
    hero: { media: imageMedia },
    metaImage: null,
    membersOnly: false,
  },
  {
    id: 2,
    slug: 'the-lab-journal',
    title: 'The lab journal: keeping the decisions behind work made with agents',
    description: null,
    publishedAt: '2026-08-02T12:00:00.000Z',
    source: 'Suits & Sandals',
    hero: { media: null, visualType: 'streakField', shader: { preset: 'depth-map-v1', seed: 42 } },
    metaImage: null,
    membersOnly: true,
  },
  {
    id: 3,
    slug: 'one-system-for-seo-and-aeo',
    title: 'One system for SEO and AEO',
    description: null,
    publishedAt: null,
    source: null,
    hero: null,
    metaImage: { ...imageMedia, width: 1200, height: 1500 },
    membersOnly: false,
  },
]

const meta = {
  title: 'Sections/MorePosts',
  component: MorePostsIndex,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The close of every post: three posts to open next, each framed as its opening shows it (the upload or share image at its own proportions, else the effect poster). The section fetches its items on the server (`getMorePosts`); this is its client index with fixture items. Opening a post behind the page curtain needs the app shell.',
      },
    },
  },
  args: { items },
} satisfies Meta<typeof MorePostsIndex>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Each target is hidden until the reveal plays its beat.
    await expect(await canvas.findByRole('heading', { name: 'More posts' })).toBeInTheDocument()
    const post = await canvas.findByRole('link', { name: /Designing with Motion/ })
    await expect(post).toHaveAttribute('href', '/posts/designing-with-motion')
    await expect(post).toHaveAttribute('data-cursor', 'view')
    await expect((await canvas.findAllByRole('link', { name: /All posts/ }))[0]).toHaveAttribute(
      'href',
      '/posts',
    )
  },
}

export const OnePost: Story = {
  args: { items: items.slice(0, 1) },
}

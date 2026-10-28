import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import type { MorePostsItem } from '@/sections/MorePosts/query'
import { imageMedia } from '@/stories/fixtures'
import { PostsIndex } from './PostsIndex.client'

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
    description: 'A journal that keeps the decisions behind work made with AI agents.',
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
    metaImage: null,
    membersOnly: false,
  },
]

const meta = {
  title: 'Sections/PostsIndex',
  component: PostsIndex,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The /posts index: a projection room. Titles in a column; the shown post’s texture is one full-bleed ground under the list, dissolving as rows reach the reading line or take the pointer. The route fetches its items on the server; opening a post behind the page curtain needs the app shell.',
      },
    },
  },
  args: { items, title: 'Posts' },
} satisfies Meta<typeof PostsIndex>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1, name: /Posts/ })).toBeInTheDocument()
    for (const { slug, title } of items) {
      await expect(canvas.getByRole('link', { name: new RegExp(title) })).toHaveAttribute(
        'href',
        `/posts/${slug}`,
      )
    }
  },
}

export const Single: Story = {
  args: { items: items.slice(0, 1) },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import type { CardPostData } from '@/components/Card/Posts/Component'
import { externalPostCardData, postCardData } from '@/stories/fixtures'
import { PostsArchive } from './PostsArchive'

const post = (slug: string, title: string, base: CardPostData = postCardData): CardPostData => ({
  ...base,
  slug,
  title,
})

const posts: CardPostData[] = [
  post('designing-with-motion', 'Designing with Motion'),
  post('the-lab-journal', 'The lab journal', externalPostCardData),
  post('type-at-every-size', 'Type at every size'),
  post('one-reveal-system', 'One reveal system'),
]

const meta = {
  title: 'Components/PostsArchive',
  component: PostsArchive,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The /posts grid: post cards two across from `sm`. The page fetches the posts and paginates below the grid.',
      },
    },
  },
  args: { posts },
} satisfies Meta<typeof PostsArchive>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const { slug, title } of posts) {
      if (slug === 'the-lab-journal') continue
      await expect(canvas.getByRole('link', { name: new RegExp(title as string) })).toHaveAttribute(
        'href',
        `/posts/${slug}`,
      )
    }
  },
}

export const Single: Story = {
  args: { posts: posts.slice(0, 1) },
}

export const Empty: Story = {
  args: { posts: [] },
}

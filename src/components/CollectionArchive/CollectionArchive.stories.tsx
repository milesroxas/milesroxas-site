import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import type { CardPostData } from '@/components/Card/Posts/Component'
import type { CardWorkData } from '@/components/Card/Works/Component'
import { postCardData, workCardData } from '@/stories/fixtures'
import { CollectionArchive } from './index'

const posts: CardPostData[] = [
  postCardData,
  { ...postCardData, slug: 'type-at-every-size', title: 'Type at every size' },
]

const works: CardWorkData[] = [
  workCardData,
  { ...workCardData, slug: 'studio-platform', title: 'Studio Platform' },
]

const meta = {
  title: 'Components/CollectionArchive',
  component: CollectionArchive,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Mixed card grid for search results and the Archive block: posts first, then works, three across from `lg`.',
      },
    },
  },
  args: { posts, works },
} satisfies Meta<typeof CollectionArchive>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: /Type at every size/ })).toHaveAttribute(
      'href',
      '/posts/type-at-every-size',
    )
    await expect(canvas.getByRole('link', { name: /Studio Platform/ })).toHaveAttribute(
      'href',
      '/works/studio-platform',
    )
  },
}

export const PostsOnly: Story = {
  args: { works: undefined },
}

export const WorksOnly: Story = {
  args: { posts: undefined },
}

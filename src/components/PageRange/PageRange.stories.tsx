import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PageRange } from './index'

const meta = {
  title: 'Components/PageRange',
  component: PageRange,
  tags: ['autodocs'],
  argTypes: {
    collection: {
      control: 'select',
      options: ['posts', 'works'],
    },
  },
} satisfies Meta<typeof PageRange>

export default meta
type Story = StoryObj<typeof meta>

export const Posts: Story = {
  args: {
    collection: 'posts',
    currentPage: 1,
    limit: 10,
    totalDocs: 42,
  },
}

export const Works: Story = {
  args: {
    collection: 'works',
    currentPage: 2,
    limit: 6,
    totalDocs: 14,
  },
}

export const SingleResult: Story = {
  args: {
    collection: 'posts',
    currentPage: 1,
    limit: 10,
    totalDocs: 1,
  },
}

export const NoResults: Story = {
  args: {
    collection: 'posts',
    currentPage: 1,
    limit: 10,
    totalDocs: 0,
  },
}

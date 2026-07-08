import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Pagination } from './index'

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 8,
  },
}

export const MiddlePage: Story = {
  args: {
    page: 4,
    totalPages: 8,
  },
}

export const LastPage: Story = {
  args: {
    page: 8,
    totalPages: 8,
  },
}

export const FewPages: Story = {
  args: {
    page: 1,
    totalPages: 2,
  },
}

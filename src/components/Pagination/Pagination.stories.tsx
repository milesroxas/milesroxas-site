import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, userEvent, within } from 'storybook/test'

import { Pagination } from './index'

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The posts archive pager: the current page between its neighbours, an ellipsis where more pages lie beyond them. Every control pushes `/posts/page/<n>` on the router.',
      },
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 8,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
  },
}

export const MiddlePage: Story = {
  args: {
    page: 4,
    totalPages: 8,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByText('More pages')).toHaveLength(2)
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }))
    await expect(getRouter().push).toHaveBeenLastCalledWith('/posts/page/5')
    await userEvent.click(canvas.getByRole('button', { name: '3' }))
    await expect(getRouter().push).toHaveBeenLastCalledWith('/posts/page/3')
  },
}

export const LastPage: Story = {
  args: {
    page: 8,
    totalPages: 8,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Go to next page' }),
    ).toBeDisabled()
  },
}

export const FewPages: Story = {
  args: {
    page: 1,
    totalPages: 2,
  },
}

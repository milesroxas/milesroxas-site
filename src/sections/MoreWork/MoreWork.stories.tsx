import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { workIndexItems } from '@/stories/fixtures'
import { MoreWorkIndex } from './MoreWork.client'

const meta = {
  title: 'Sections/MoreWork',
  component: MoreWorkIndex,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The close of every case study: a contents page of other works. Wide screens with a hovering pointer get one sticky plate beside the rows, which shows the row under the pointer (with a WebGL wave between pictures where the GPU budget allows); elsewhere every row carries its own picture. The section fetches its items on the server (`getMoreWork`); this is its client index with fixture items. A row opens its case study the way a work card does: Storybook mocks the router, so only the exit plays.',
      },
    },
  },
  args: { items: workIndexItems },
} satisfies Meta<typeof MoreWorkIndex>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Each target is hidden until the reveal plays its beat.
    await expect(await canvas.findByRole('heading', { name: /More work/ })).toBeInTheDocument()
    const row = await canvas.findByRole('link', { name: /Brand Refresh/ })
    await expect(row).toHaveAttribute('href', '/works/brand-refresh')
    await expect(row).toHaveAttribute('data-cursor', 'view')
    await expect(await canvas.findByRole('link', { name: /All work/ })).toHaveAttribute(
      'href',
      '/works',
    )
  },
}

export const TwoWorks: Story = {
  args: { items: workIndexItems.slice(0, 2) },
}

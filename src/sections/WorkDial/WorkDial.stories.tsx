import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { streamVideoFixture, workIndexItems } from '@/stories/fixtures'
import { WorkDial } from './WorkDial.client'

const meta = {
  title: 'Sections/WorkDial',
  component: WorkDial,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The works index (`/works`) as a dial: one picture fixed in the centre and the list turning past it as the page scrolls. The row on the centre line is shown; the others dim, shrink and tilt away like a drum, and a resting page settles on the nearest row. Phones read it as a plain list under a pinned plate. The site scrolls it through Lenis; here it falls back to native scrolling. A row or the picture opens the case study by travelling the plate to the hero: Storybook mocks the router, so only the exit plays.',
      },
    },
  },
  args: {
    items: workIndexItems,
    title: 'Work',
    lead: 'Brand, web and product work for teams that want their site to explain itself.',
  },
} satisfies Meta<typeof WorkDial>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1, name: /Work/ })).toBeInTheDocument()
    const rows = within(canvas.getByRole('list')).getAllByRole('link')
    await expect(rows).toHaveLength(workIndexItems.length)
    await expect(rows[0]).toHaveAttribute('href', '/works/brand-refresh')
    await expect(rows[0]).toHaveAttribute('data-active')
  },
}

export const WithoutLead: Story = {
  args: { lead: null },
}

/**
 * A work whose picture is a video: the plate plays it only while its row is
 * shown, and warms the rows either side. Streams from Cloudflare, so it needs
 * network.
 */
export const WithVideo: Story = {
  args: {
    items: workIndexItems.map((item, index) =>
      index === 1 ? { ...item, media: streamVideoFixture } : item,
    ),
  },
}

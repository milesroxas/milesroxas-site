import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Footer } from '@/Footer/Component'
import { ExternalArticle } from './index'

const meta = {
  title: 'Sections/ExternalArticle',
  component: ExternalArticle,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The way out of an external post: one link spans the band, labelled Read under the site cursor. The heading enters on the shared reveal; once it lands, the arrow slides in and the rule draws. Resting on the band sends the arrow out of its box as its twin comes in behind, and draws the rule in full ink.',
      },
    },
  },
  args: {
    url: 'https://www.suits-sandals.com/lab/lab-journal',
    publisher: 'Suits & Sandals',
    address: 'suits-sandals.com/lab/lab-journal',
  },
} satisfies Meta<typeof ExternalArticle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Hidden until the reveal plays its beat.
    const link = await within(canvasElement).findByRole('link', {
      name: /Read the full article on/,
    })
    await expect(link).toHaveAttribute('href', 'https://www.suits-sandals.com/lab/lab-journal')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
    await expect(link).toHaveAttribute('data-cursor', 'read')
    // The arrow and rule hold back until the reveal lands, then arrive.
    const band = canvasElement.querySelector('.group\\/out')
    await waitFor(() => expect(band).not.toHaveAttribute('data-arrival'), { timeout: 5000 })
  },
}

export const LongPublisher: Story = {
  args: {
    publisher: 'The Journal of Design Operations',
    url: 'https://example.com/essays/2026/a-very-long-article-slug-that-wraps-on-phones',
    address: 'example.com/essays/2026/a-very-long-article-slug-that-wraps-on-phones',
  },
}

/** Ending the page, the band paints under the Footer's dock clearance. */
export const Last: Story = {
  args: { last: true },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Footer />
      </>
    ),
  ],
}

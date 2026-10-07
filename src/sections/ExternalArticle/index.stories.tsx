import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExternalArticle } from './index'

const meta = {
  title: 'Sections/ExternalArticle',
  component: ExternalArticle,
  parameters: { layout: 'fullscreen' },
  args: {
    url: 'https://www.suits-sandals.com/lab/lab-journal',
    publisher: 'Suits & Sandals',
    address: 'suits-sandals.com/lab/lab-journal',
  },
} satisfies Meta<typeof ExternalArticle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongPublisher: Story = {
  args: {
    publisher: 'The Journal of Design Operations',
    url: 'https://example.com/essays/2026/a-very-long-article-slug-that-wraps-on-phones',
    address: 'example.com/essays/2026/a-very-long-article-slug-that-wraps-on-phones',
  },
}

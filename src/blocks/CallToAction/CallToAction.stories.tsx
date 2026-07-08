import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { simpleRichText } from '@/stories/fixtures'
import { CallToActionBlock } from './Component'

const meta = {
  title: 'Blocks/CallToAction',
  component: CallToActionBlock,
  tags: ['autodocs'],
  args: {
    blockType: 'cta',
    richText: simpleRichText,
    links: [
      {
        id: 'cta-link-1',
        link: {
          type: 'custom',
          url: '/contact',
          label: 'Get in touch',
          appearance: 'default',
        },
      },
    ],
  },
  argTypes: {
    blockType: { table: { disable: true } },
  },
} satisfies Meta<typeof CallToActionBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TwoLinks: Story = {
  args: {
    links: [
      {
        id: 'cta-link-1',
        link: {
          type: 'custom',
          url: '/contact',
          label: 'Get in touch',
          appearance: 'default',
        },
      },
      {
        id: 'cta-link-2',
        link: {
          type: 'custom',
          url: '/works',
          label: 'View work',
          appearance: 'outline',
        },
      },
    ],
  },
}

export const TextOnly: Story = {
  args: { links: [] },
}

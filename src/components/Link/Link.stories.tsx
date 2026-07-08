import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CMSLink } from './index'

const meta = {
  title: 'Components/CMSLink',
  component: CMSLink,
  tags: ['autodocs'],
  args: {
    type: 'custom',
    url: '/works',
    label: 'View work',
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: ['inline', 'default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'clear'],
    },
  },
} satisfies Meta<typeof CMSLink>

export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {}

export const ButtonDefault: Story = {
  args: { appearance: 'default' },
}

export const ButtonOutline: Story = {
  args: { appearance: 'outline', size: 'lg' },
}

export const NewTab: Story = {
  args: {
    appearance: 'default',
    label: 'External link',
    newTab: true,
    url: 'https://example.com',
  },
}

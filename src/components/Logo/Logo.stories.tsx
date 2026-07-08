import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Logo } from './Logo'

const meta = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: {
    className: 'w-72',
  },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const White: Story = {
  args: { color: 'white' },
  render: (args) => (
    <div className="bg-neutral-950 p-8">
      <Logo {...args} />
    </div>
  ),
}

export const Accent: Story = {
  args: { color: 'hsl(21 90% 48%)' },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Kbd, KbdGroup } from './kbd'

const meta = {
  title: 'UI/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: '⌘K',
  },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

/** The Ask shortcut, as the dock's tooltip shows it. */
export const Default: Story = {}

export const SingleKey: Story = {
  args: { children: 'C' },
}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
}

/** Sized to sit inside a line of text. */
export const InText: Story = {
  render: () => (
    <p className="text-muted-foreground text-xs">
      Keep this draft to compare against <Kbd>C</Kbd>
    </p>
  ),
}

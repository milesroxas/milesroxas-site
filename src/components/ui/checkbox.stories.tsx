import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Checkbox } from './checkbox'
import { Label } from './label'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    'aria-label': 'Toggle option',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
  },
}

export const Checked: Story = {
  args: {
    'aria-label': 'Toggle option',
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    'aria-label': 'Toggle option',
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-newsletter" />
      <Label htmlFor="checkbox-newsletter">Subscribe to newsletter</Label>
    </div>
  ),
}

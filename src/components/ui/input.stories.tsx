import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Type here…',
  },
  argTypes: {
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Type here…')
    await userEvent.type(input, 'Hello')
    await expect(input).toHaveValue('Hello')
  },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-1.5">
      <Label htmlFor="input-with-label">Email</Label>
      <Input {...args} id="input-with-label" type="email" />
    </div>
  ),
  args: {
    placeholder: 'jane@example.com',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const File: Story = {
  args: { type: 'file', placeholder: undefined },
}

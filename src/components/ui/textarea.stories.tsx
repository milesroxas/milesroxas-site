import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Label } from './label'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Write your message…',
  },
  argTypes: {
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-1.5">
      <Label htmlFor="textarea-with-label">Message</Label>
      <Textarea {...args} id="textarea-with-label" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

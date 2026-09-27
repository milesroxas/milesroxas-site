import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Checkbox } from './legacy-checkbox'
import { Label } from './legacy-label'

const meta = {
  title: 'UI/Legacy/Label',
  component: Label,
  tags: ['autodocs'],
  args: {
    children: 'Label',
  },
  argTypes: {
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithControl: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="label-terms" />
      <Label htmlFor="label-terms">Accept terms and conditions</Label>
    </div>
  ),
}

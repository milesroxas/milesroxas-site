import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, screen, userEvent, within } from 'storybook/test'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Choose a fruit" className="w-64">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Choose a fruit' }))
    // Select content renders in a portal outside the canvas element
    const option = await screen.findByRole('option', { name: 'Banana' })
    await userEvent.click(option)
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Banana')
  },
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger aria-label="Choose a fruit" className="w-64">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  ),
}

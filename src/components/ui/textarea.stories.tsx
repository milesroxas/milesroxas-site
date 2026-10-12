import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { FieldPanel } from './field'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Message',
    placeholder: 'What are you working on?',
    variant: 'default',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'bare'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

/** Grows with its content (`field-sizing-content`) from its minimum height. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox')
    await userEvent.type(textarea, 'A new site for a design studio.')
    await expect(textarea).toHaveValue('A new site for a design studio.')
  },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/** The contact form's message: `bare` inside `FieldPanel`, which owns the frame. */
export const Bare: Story = {
  args: { variant: 'bare', className: 'text-foreground' },
  decorators: [
    (Story) => (
      <FieldPanel>
        <Story />
      </FieldPanel>
    ),
  ],
}

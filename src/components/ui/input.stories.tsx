import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Search your looks',
    placeholder: 'Search your looks',
    variant: 'default',
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'line', 'bare', 'value'] },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** The boxed utility control (the Studio's look search). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await userEvent.type(input, 'grid')
    await expect(input).toHaveValue('grid')
  },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'grid' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * The editorial control: a hairline that rests on `--input`, darkens to the
 * foreground once filled (a blank placeholder lets CSS tell), and takes the
 * primary on focus.
 */
export const Line: Story = {
  args: { 'aria-label': 'Name', placeholder: ' ', variant: 'line' },
}

export const LineFilled: Story = {
  args: { 'aria-label': 'Name', defaultValue: 'Jane Doe', placeholder: ' ', variant: 'line' },
}

export const LineInvalid: Story = {
  args: { 'aria-invalid': true, 'aria-label': 'Email', defaultValue: 'jane@', variant: 'line' },
}

/** No chrome of its own: the container draws the field (an `inset` FieldGroup row). */
export const Bare: Story = {
  args: { 'aria-label': 'Name', placeholder: 'Your name', variant: 'bare' },
  decorators: [
    (Story) => (
      <div className="flex min-h-9 items-center rounded-md px-3 ring-1 ring-foreground/10">
        <Story />
      </div>
    ),
  ],
}

/** The number beside an inspector slider: mono, right-set, tabular, no spinner. */
export const Value: Story = {
  args: {
    'aria-label': 'Speed',
    className: 'w-20',
    defaultValue: 0.35,
    max: 1,
    min: 0,
    placeholder: undefined,
    step: 0.01,
    type: 'number',
    variant: 'value',
  },
}

/** A disabled value drops its box and dims, so an inactive row reads as a readout. */
export const ValueDisabled: Story = {
  args: { ...Value.args, disabled: true },
}

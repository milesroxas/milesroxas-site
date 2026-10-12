import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Slider } from './slider'

const format = (value: number) => value.toFixed(2)

const meta = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    'aria-label': 'Speed',
    defaultValue: [0.35],
    formatValue: format,
    max: 1,
    min: 0,
    step: 0.01,
    variant: 'default',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'changed'] },
    formatValue: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** The value bubble rides above the thumb while it is dragged (`formatValue` turns it on). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('slider')
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '0.36')
  },
}

/**
 * A value away from its default: the fill takes the primary, and a tick marks
 * the default under the track, a magnet the thumb snaps to within 4px.
 */
export const Changed: Story = {
  args: {
    defaultValue: [0.6],
    marks: [{ value: 0.35 }],
    variant: 'changed',
  },
}

/** A signed range fills from zero, which crosses the track as a mark of its own. */
export const Signed: Story = {
  args: {
    'aria-label': 'Drift',
    defaultValue: [-0.4],
    marks: [{ value: 0, kind: 'zero' }],
    max: 1,
    min: -1,
    origin: 0,
  },
}

/** Two thumbs on one track; dragging cannot cross them. */
export const Range: Story = {
  args: {
    'aria-label': 'Length range',
    defaultValue: [0.2, 0.7],
    minStepsBetweenThumbs: 0,
    thumbLabels: ['Shortest', 'Longest'],
  },
}

/** A typed pair that crossed: the thumbs turn destructive until it is fixed. */
export const Invalid: Story = {
  args: { ...Range.args, invalid: true },
}

/** Fill, track and thumb all dim, so the row reads inactive rather than broken. */
export const Disabled: Story = {
  args: { disabled: true },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, screen, userEvent, within } from 'storybook/test'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Format">
        <SelectValue placeholder="Choose a format" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Raster</SelectLabel>
          <SelectItem value="webp">WebP</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vector</SelectLabel>
          <SelectItem value="svg">SVG</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Format' }))
    // Select content renders in a portal outside the canvas element
    await userEvent.click(await screen.findByRole('option', { name: 'JPEG' }))
    // The canvas stays aria-hidden until the menu's fade-out ends.
    await expect(await canvas.findByRole('combobox')).toHaveTextContent('JPEG')
  },
}

export const Small: Story = {
  render: (args) => (
    <Select defaultValue="webp" {...args}>
      <SelectTrigger aria-label="Format" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="webp">WebP</SelectItem>
        <SelectItem value="jpeg">JPEG</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  ...Small,
  args: { disabled: true },
}

/**
 * A Streak Studio parameter: `field` height to match the row's value inputs,
 * the menu aligned to the trigger's end, and a second line under each option
 * that the trigger leaves out.
 */
export const InspectorField: Story = {
  render: (args) => (
    <div className="w-56">
      <Select defaultValue="simplex" {...args}>
        <SelectTrigger aria-label="Noise" className="w-full max-w-56" size="field">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem description="Smooth, organic flow with no grid artifacts." value="simplex">
            Simplex
          </SelectItem>
          <SelectItem description="Cellular pockets, like light through water." value="worley">
            Worley
          </SelectItem>
          <SelectItem description="Layered octaves for a rougher surface." value="fbm">
            Fractal
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Noise' }))
    await userEvent.click(await screen.findByRole('option', { name: /Worley/ }))
    const trigger = await canvas.findByRole('combobox')
    await expect(trigger).toHaveTextContent('Worley')
    await expect(trigger).not.toHaveTextContent('Cellular')
  },
}

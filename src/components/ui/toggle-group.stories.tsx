import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'single',
    variant: 'segmented',
    size: 'default',
    defaultValue: 'dark',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'segmented'] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    type: { table: { disable: true } },
  },
  render: (args) => (
    <ToggleGroup {...args} aria-label="Surface" className="w-auto">
      <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
      <ToggleGroupItem value="light">Light</ToggleGroupItem>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `segmented`: one recessed track with the chosen option lifted onto a plate
 * that slides between segments (the Streak Studio's stage controls).
 */
export const Segmented: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const light = canvas.getByRole('radio', { name: 'Light' })
    await userEvent.click(light)
    await expect(light).toHaveAttribute('data-state', 'on')
    const plate = canvasElement.querySelector<HTMLElement>('[data-slot="toggle-group-indicator"]')
    await waitFor(() => expect(plate?.style.width).toBe(`${light.offsetWidth}px`))
  },
}

/** Control heights: inspector row (`sm`, 26px), toolbar (30px), header (`lg`, 34px). */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        // `key` ahead of the spread, so the JSX runtime (not createElement) builds the children.
        <ToggleGroup
          key={size}
          {...args}
          aria-label={`Surface ${size}`}
          className="w-auto"
          size={size}
        >
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
}

/** The stage header's view switch: Compare stays disabled until a draft is kept. */
export const DisabledOption: Story = {
  args: { size: 'lg', defaultValue: 'draft' },
  render: (args) => (
    <ToggleGroup {...args} aria-label="View" className="w-auto">
      <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
      <ToggleGroupItem disabled value="compare">
        Compare
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

/** A row's two- and three-way choices fill the control column at inspector height. */
export const FillsColumn: Story = {
  args: { size: 'sm', defaultValue: 'grid' },
  render: (args) => (
    <div className="w-56">
      <ToggleGroup {...args} aria-label="Layout">
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
        <ToggleGroupItem value="scatter">Scatter</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

/**
 * Segments wrapped in tooltip triggers, as a parameter whose options each
 * earn a line: the segment keeps its own on/off state under the trigger's.
 */
export const WithTooltips: Story = {
  args: { size: 'sm', defaultValue: 'off' },
  render: (args) => (
    <TooltipProvider>
      <div className="w-56">
        <ToggleGroup {...args} aria-label="Trails">
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="off">Off</ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Dashes stay crisp.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="on">On</ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Each dash leaves a fading trail.
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const on = canvas.getByRole('radio', { name: 'On' })
    await userEvent.click(on)
    await expect(on).toHaveAttribute('data-state', 'on')
    await expect(canvas.getByRole('radio', { name: 'Off' })).toHaveAttribute('data-state', 'off')
  },
}

/** `default`: a loose row of ghost toggles for a toolbar. */
export const Toolbar: Story = {
  args: { variant: 'default' },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Label',
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A Streak Studio row: the label column beside its control. */
export const WithControl: Story = {
  render: () => (
    <div className="grid w-72 grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-2.5">
      <Label className="min-h-9 cursor-default text-foreground/80 text-xs/4" htmlFor="label-width">
        Width
      </Label>
      <Input
        id="label-width"
        max={1920}
        min={320}
        type="number"
        defaultValue={1440}
        variant="value"
      />
    </div>
  ),
}

/** A label after a disabled peer dims with it. */
export const PeerDisabled: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox disabled id="label-peer" />
      <Label htmlFor="label-peer">Transparent ground</Label>
    </div>
  ),
}

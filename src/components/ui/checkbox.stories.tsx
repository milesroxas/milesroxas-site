import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Checkbox } from './checkbox'
import { Label } from './label'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    'aria-label': 'Toggle option',
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox')
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
  },
}

export const Checked: Story = {
  args: { defaultChecked: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true },
}

function AlphaRow() {
  const [format, setFormat] = useState<'webp' | 'jpeg'>('webp')
  const [transparent, setTransparent] = useState(true)
  const jpeg = format === 'jpeg'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={transparent && !jpeg}
          disabled={jpeg}
          id="checkbox-alpha"
          onCheckedChange={(checked) => setTransparent(checked === true)}
        />
        <Label htmlFor="checkbox-alpha">Alpha</Label>
        <span className="text-[11px]/4 text-muted-foreground">
          {jpeg ? 'JPEG is always filled.' : 'Transparent ground.'}
        </span>
      </div>
      <button
        className="self-start text-xs underline underline-offset-2"
        onClick={() => setFormat(jpeg ? 'webp' : 'jpeg')}
        type="button"
      >
        Switch to {jpeg ? 'WebP' : 'JPEG'}
      </button>
    </div>
  )
}

/**
 * The Streak Studio's export row: the box carries its own sentence, and a
 * format that cannot hold alpha disables it (the label dims with it).
 */
export const WithLabel: Story = {
  render: () => <AlphaRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox', { name: 'Alpha' })
    await expect(checkbox).toBeChecked()
    await userEvent.click(canvas.getByRole('button', { name: 'Switch to JPEG' }))
    await expect(checkbox).toBeDisabled()
    await expect(canvas.getByText('JPEG is always filled.')).toBeVisible()
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const panels = [
  { value: 'look', label: 'Look', body: 'Shape, motion and color for the field.' },
  { value: 'pointer', label: 'Pointer', body: 'How the field answers the cursor.' },
  { value: 'export', label: 'Export', body: 'Capture a still at a chosen size.' },
]

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    defaultValue: 'look',
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** The boxed segmented list. */
export const Default: Story = {
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList>
        {panels.map((panel) => (
          <TabsTrigger key={panel.value} value={panel.value}>
            {panel.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((panel) => (
        <TabsContent
          className="text-muted-foreground text-xs/5"
          key={panel.value}
          value={panel.value}
        >
          {panel.body}
        </TabsContent>
      ))}
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Pointer' }))
    await expect(canvas.getByText('How the field answers the cursor.')).toBeVisible()
  },
}

/**
 * `line`: the Streak Studio inspector's tab strip, text on a hairline with the
 * active tab underlined in the foreground ink, the way Payload draws its own.
 */
export const Line: Story = {
  render: (args) => (
    <Tabs {...args} className="w-80 gap-0">
      <TabsList variant="line">
        {panels.map((panel) => (
          <TabsTrigger key={panel.value} value={panel.value}>
            {panel.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((panel) => (
        <TabsContent
          className="flex flex-col pt-5 text-muted-foreground text-xs/5"
          key={panel.value}
          value={panel.value}
        >
          {panel.body}
        </TabsContent>
      ))}
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Export' }))
    await expect(canvas.getByRole('tab', { name: 'Export' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // An inactive panel keeps its node with `hidden`, which must beat its `flex` utility.
    await userEvent.click(canvas.getByRole('tab', { name: 'Look' }))
    const exportPanel = canvasElement.querySelector(
      '[data-slot="tabs-content"][data-state="inactive"]',
    )
    await expect(exportPanel).not.toBeVisible()
  },
}

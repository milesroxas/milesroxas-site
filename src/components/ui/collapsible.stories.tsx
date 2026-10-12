import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

const rows = ['Count', 'Segments', 'Speed', 'Drift']

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Collapsible {...args} className="border-border border-b">
      <CollapsibleTrigger>Motion</CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-0.5 pb-3 text-muted-foreground text-xs/4">
          {rows.map((row) => (
            <li className="flex h-8 items-center" key={row}>
              {row}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  ),
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Motion' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByText('Speed')).toBeVisible())
  },
}

export const Open: Story = {
  args: { defaultOpen: true },
}

/**
 * A Streak Studio inspector section: the closed header carries a summary at
 * its far edge (the change count), and the open one comes up to full ink.
 */
export const InspectorSection: Story = {
  render: () => (
    <div className="flex flex-col">
      {['Shape', 'Motion', 'Color'].map((name, index) => (
        <Collapsible className="border-border border-b" defaultOpen={index === 1} key={name}>
          <CollapsibleTrigger className="text-[11px]/4 text-muted-foreground uppercase tracking-[0.06em] hover:text-foreground data-[state=open]:text-foreground">
            {name}
            <span className="ml-auto flex items-center gap-2 whitespace-nowrap font-mono font-normal text-[11px]/3.5 text-muted-foreground normal-case tabular-nums tracking-normal group-data-[state=open]/collapsible:hidden">
              {index === 0 && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
              {index === 0 ? '2 changed' : '4'}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-0.5 pb-3 text-foreground/80 text-xs/4">
              {rows.map((row) => (
                <li className="flex h-8 items-center" key={row}>
                  {row}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  ),
}

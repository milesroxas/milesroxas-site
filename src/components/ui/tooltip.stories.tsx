import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconMessageCircle } from '@tabler/icons-react'
import { expect, screen, userEvent, within } from 'storybook/test'
import { Button } from './button'
import { Kbd } from './kbd'
import { Label } from './label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // Every call site mounts its own provider (the dock, the Studio's stage and inspector).
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Restore</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-56" side="bottom" sideOffset={6}>
        Put what is on the site back in the draft. Undo brings your changes back.
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: 'Restore' }))
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Put what is on the site')
  },
}

/** The dock's Ask button: a label and its shortcut on the inverted pill. */
export const WithShortcut: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button aria-label="Ask" size="icon-lg" variant="ghost">
          <IconMessageCircle />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        Ask
        <Kbd>⌘K</Kbd>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: 'Ask' }))
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Ask⌘K')
  },
}

/**
 * `panel`: the Studio's parameter tooltip. A popover card with a title, the
 * range line and a shortcut row; it arrives with blur and scale from its edge.
 */
export const Panel: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Label className="min-h-9 cursor-default text-foreground/80 text-xs/4">Speed</Label>
      </TooltipTrigger>
      <TooltipContent collisionPadding={12} side="left" sideOffset={12} variant="panel">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="flex-1 font-semibold text-[13px]/4 text-foreground">Speed</span>
            <span className="font-mono text-[11px]/3.5 text-muted-foreground">speed</span>
          </div>
          <p className="text-pretty text-foreground/80">
            How fast the dashes stream along the axis.
          </p>
          <p className="flex gap-3 whitespace-nowrap font-mono text-[11px]/3.5 text-muted-foreground">
            <span>0–1</span>
            <span>step 0.01</span>
            <span>default 0.35</span>
          </p>
          <p className="border-muted border-t pt-2 font-mono text-[10px]/3.5 text-muted-foreground uppercase tracking-[0.02em]">
            ↑↓ step · ⇧ ×10 · ⏎ type
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText('Speed'))
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('step 0.01')
  },
}

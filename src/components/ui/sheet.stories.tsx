import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Sheet>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to the profile here, then save when done.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>From the {side}</SheetTitle>
              <SheetDescription>Slide-out panel anchored to the {side} edge.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/**
 * A short bottom sheet the way Contents and Ask use it on a phone: inset from
 * the edges on the chrome's corner, no close button (the drag handle and the
 * scrim close it), and a lighter scrim through `overlayClassName` so the page
 * stays readable behind it.
 */
export const BottomSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Contents</Button>
      </SheetTrigger>
      <SheetContent
        className="gap-0 rounded-lg px-2 pb-3 data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-2 data-[side=bottom]:border-t-0"
        overlayClassName="bg-scrim/30 supports-backdrop-filter:backdrop-blur-none"
        showCloseButton={false}
        side="bottom"
      >
        <SheetHeader className="px-2 py-3">
          <SheetTitle>On this page</SheetTitle>
          <SheetDescription className="sr-only">Jump to a section.</SheetDescription>
        </SheetHeader>
        <ol className="flex flex-col text-sm">
          {['Context', 'Approach', 'Outcome'].map((entry) => (
            <li className="hover:bg-muted rounded-md px-2 py-2.5" key={entry}>
              {entry}
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Contents' }))
    const sheet = await screen.findByRole('dialog')
    await waitFor(() => expect(within(sheet).getByText('On this page')).toBeVisible())
    await expect(within(sheet).queryByRole('button', { name: 'Close' })).toBeNull()
  },
}

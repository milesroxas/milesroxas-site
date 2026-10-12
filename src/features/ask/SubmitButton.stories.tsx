import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { AskTextarea } from './Composer'
import { ASK_PLACEHOLDER } from './copy'
import { AskSubmitButton, askComposerButton, askComposerIcon } from './SubmitButton'

/**
 * The composer's one button on every Ask surface: Ask while idle, Stop while a
 * reply is in flight (enabled, never a dimmed arrow), the two glyphs
 * crossfading in one cell. With nothing to send it rests as a quiet tile.
 *
 * Shown in the /ask page's composer (`AskTextarea`, where Enter sends and
 * Shift+Enter breaks a line); `InDockField` is the one-line field the dock's
 * Ask panel and phone sheet use.
 */
const meta = {
  title: 'Features/Ask/SubmitButton',
  component: AskSubmitButton,
  parameters: { layout: 'centered' },
  args: { busy: false, canSend: true, onStop: fn() },
  render: (args) => (
    <form className="w-lg" onSubmit={(event) => event.preventDefault()}>
      <InputGroup>
        <AskTextarea defaultValue="What kind of work does Miles do?" rows={2} />
        <InputGroupAddon align="block-end">
          <AskSubmitButton {...args} className="ml-auto" />
        </InputGroupAddon>
      </InputGroup>
    </form>
  ),
} satisfies Meta<typeof AskSubmitButton>

export default meta

type Story = StoryObj<typeof meta>

/** A question long enough to send. */
export const Ready: Story = {}

/** Nothing to send yet: a quiet tile with a faint arrow, so the field reads as waiting. */
export const Empty: Story = {
  args: { canSend: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Ask' })).toBeDisabled()
  },
}

/** A reply is streaming: the button is Stop, and pressing it aborts the reply. */
export const Busy: Story = {
  args: { busy: true, canSend: false },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(args.onStop).toHaveBeenCalledOnce()
  },
}

/** The dock's one-line field: the button sits inside its end, its corner concentric with the field's. */
export const InDockField: Story = {
  args: { canSend: false },
  render: (args) => (
    <form className="w-sm" onSubmit={(event) => event.preventDefault()}>
      <InputGroup className="border-transparent bg-foreground/6" variant="field">
        <InputGroupInput aria-label="Your question" placeholder={ASK_PLACEHOLDER} />
        <AskSubmitButton {...args} className={askComposerButton} iconClassName={askComposerIcon} />
      </InputGroup>
    </form>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconArrowUp, IconPlayerStopFilled, IconSearch, IconSparkles } from '@tabler/icons-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'
import { Kbd } from './kbd'

/** Ask's send button: the `--ask-send-size` tile, a quiet plate while there is nothing to send. */
const sendButton =
  'size-(--ask-send-size) disabled:bg-foreground/8 disabled:text-foreground/35 disabled:opacity-100'

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search" />
      <InputGroupAddon align="inline-end">
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithText: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Site" placeholder="milesroxas.com" />
    </InputGroup>
  ),
}

function AskFieldDemo({ busy = false }: { busy?: boolean }) {
  const [question, setQuestion] = useState('')
  const canSend = question.trim().length >= 3
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <InputGroup
        className="bg-foreground/6 dark:bg-foreground/6 border-transparent"
        variant="field"
      >
        <InputGroupAddon className="p-0">
          <IconSparkles className="text-brand size-4" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Your question"
          autoComplete="off"
          enterKeyHint="send"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about Miles’s work"
          value={question}
        />
        <InputGroupButton
          aria-busy={busy || undefined}
          className={sendButton}
          disabled={!busy && !canSend}
          size="icon-sm"
          type={busy ? 'button' : 'submit'}
          variant="default"
        >
          {busy ? <IconPlayerStopFilled aria-hidden /> : <IconArrowUp aria-hidden />}
          <span className="sr-only">{busy ? 'Stop' : 'Ask'}</span>
        </InputGroupButton>
      </InputGroup>
    </form>
  )
}

/**
 * `field`: the Ask field on the phone sheet (its tinted well). One line with
 * the send button inside its end, sized and cornered by the chrome's
 * `--ask-field-*` tokens so the button stays concentric with the field.
 */
export const AskField: Story = {
  render: () => <AskFieldDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const send = canvas.getByRole('button', { name: 'Ask' })
    await expect(send).toBeDisabled()
    await userEvent.type(canvas.getByRole('textbox', { name: 'Your question' }), 'Rates?')
    await expect(send).toBeEnabled()
  },
}

/** While a reply streams the send button is an enabled Stop, never a dimmed arrow. */
export const AskFieldBusy: Story = {
  render: () => <AskFieldDemo busy />,
}

/** The /ask page composer: a textarea with the send button in a block-end addon. */
export const Composer: Story = {
  render: (args) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <InputGroup {...args}>
        <InputGroupTextarea
          aria-label="Your question"
          placeholder="Ask about Miles’s work"
          required
          rows={2}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton className="ml-auto" size="icon-sm" type="submit" variant="default">
            <IconArrowUp aria-hidden />
            <span className="sr-only">Ask</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-invalid aria-label="Email" defaultValue="jane@" />
    </InputGroup>
  ),
}

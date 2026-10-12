import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from './button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldMeta,
  FieldPanel,
} from './field'
import { Input } from './input'
import { Spinner } from './spinner'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Field',
  component: Field,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The contact form's field: a mono label that turns primary on focus over a
 * `line` input whose rule follows the same three states.
 */
export const Editorial: Story = {
  render: () => (
    <Field className="gap-3">
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel htmlFor="field-name" variant="mono">
          Name
        </FieldLabel>
      </div>
      <Input
        autoComplete="name"
        className="text-foreground"
        id="field-name"
        placeholder=" "
        variant="line"
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Name'), 'Jane Doe')
    await expect(canvas.getByLabelText('Name')).toHaveValue('Jane Doe')
  },
}

/** A problem replaces the note under the control, and the label turns destructive with it. */
export const EditorialInvalid: Story = {
  render: () => (
    <Field className="gap-3" data-invalid>
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel htmlFor="field-email" variant="mono">
          Email
        </FieldLabel>
      </div>
      <Input
        aria-describedby="field-email-error"
        aria-invalid
        className="text-foreground"
        defaultValue="jane@"
        id="field-email"
        type="email"
        variant="line"
      />
      <FieldError id="field-email-error">
        <IconAlertCircle aria-hidden />
        Enter an email address Miles can reply to.
      </FieldError>
    </Field>
  ),
}

function MessageField() {
  const [message, setMessage] = useState('')
  return (
    <Field className="gap-3">
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel htmlFor="field-message" variant="mono">
          Message
        </FieldLabel>
        <FieldMeta>
          <span aria-live="polite">{message.length.toLocaleString()} / 1,200</span>
        </FieldMeta>
      </div>
      <FieldPanel>
        <Textarea
          className="text-foreground"
          id="field-message"
          maxLength={1200}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What are you working on?"
          value={message}
          variant="bare"
        />
      </FieldPanel>
      <FieldDescription>Your questions from Ask are included. Edit anything.</FieldDescription>
    </Field>
  )
}

/** `FieldPanel` frames a `bare` textarea; `FieldMeta` sets the counter on the label's baseline. */
export const MessagePanel: Story = {
  render: () => <MessageField />,
}

/**
 * `inset`: Ask's handoff fields as rows of one raised block, a fixed label
 * lane beside each `bare` input, hairlines from the label on. The invalid
 * row rings inside, since the group clips anything outside it.
 */
export const InsetGroup: Story = {
  render: () => (
    <FieldGroup variant="inset">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-inset-name">Name</FieldLabel>
        <Input autoComplete="name" id="field-inset-name" placeholder="Your name" variant="bare" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-inset-email">Email</FieldLabel>
        <Input
          autoComplete="email"
          defaultValue="jane@example.com"
          id="field-inset-email"
          type="email"
          variant="bare"
        />
        <FieldDescription>From your message</FieldDescription>
      </Field>
    </FieldGroup>
  ),
}

export const InsetGroupInvalid: Story = {
  render: () => (
    <FieldGroup variant="inset">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-invalid-name">Name</FieldLabel>
        <Input defaultValue="Jane" id="field-invalid-name" variant="bare" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-invalid-email">Email</FieldLabel>
        <Input aria-invalid defaultValue="jane@" id="field-invalid-email" variant="bare" />
      </Field>
    </FieldGroup>
  ),
}

/** A horizontal action row: what stopped the send leads, the buttons sit at the trailing edge. */
export const ActionRow: Story = {
  render: () => (
    <Field className="justify-end" orientation="horizontal">
      <FieldError className="mr-auto">
        <IconAlertCircle aria-hidden />
        That didn&apos;t send. Try again.
      </FieldError>
      <Button className="font-normal" size="chat" variant="ghost">
        Cancel
      </Button>
      <Button disabled size="chat">
        <Spinner />
        Send to Miles
      </Button>
    </Field>
  ),
}

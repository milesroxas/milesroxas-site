import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconArrowRight, IconArrowUpRight, IconCheck, IconDots } from '@tabler/icons-react'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from './card'
import { Field, FieldGroup, FieldLabel } from './field'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    variant: { control: 'inline-radio', options: ['default', 'inset'] },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short supporting description for the card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. Compose header, content, and footer as needed.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

/** `sm` tightens the card's spacing token from 16px to 12px. */
export const Small: Story = {
  ...Default,
  args: { size: 'sm' },
}

/** `CardAction` takes the header's trailing column beside the title and description. */
export const WithAction: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Three unread since yesterday.</CardDescription>
        <CardAction>
          <Button aria-label="More" size="icon-sm" variant="ghost">
            <IconDots />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
        <CardDescription>Send a message and I will get back to you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-form-name">Name</Label>
          <Input id="card-form-name" placeholder="Jane Doe" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-form-email">Email</Label>
          <Input id="card-form-email" placeholder="jane@example.com" type="email" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Send</Button>
      </CardFooter>
    </Card>
  ),
}

/**
 * `inset`: a card inside a conversation (Ask's handoff form). Muted ground, no
 * ring, chat-sized copy, and a ruled caption footer that truncates.
 */
export const Inset: Story = {
  render: () => (
    <Card className="w-96" variant="inset">
      <CardHeader>
        <CardDescription className="max-md:text-sm/5">
          Miles will reply by email within one business day. Your question comes with it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup variant="inset">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="card-inset-name">Name</FieldLabel>
            <Input id="card-inset-name" placeholder="Your name" variant="bare" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="card-inset-email">Email</FieldLabel>
            <Input
              id="card-inset-email"
              placeholder="you@company.com"
              type="email"
              variant="bare"
            />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardContent>
        <div className="flex items-center justify-end gap-2">
          <Button className="font-normal" size="chat" variant="ghost">
            Cancel
          </Button>
          <Button size="chat">Send to Miles</Button>
        </div>
      </CardContent>
      <CardFooter>
        <span>Prefer the full form?</span>
        <Button size="clear" variant="link">
          Contact page
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  ),
}

/** The sent receipt: `CardIcon` leads the header as a status mark beside every line of it. */
export const InsetReceipt: Story = {
  render: () => (
    <Card className="w-96" role="status" variant="inset">
      <CardHeader>
        <CardIcon>
          <IconCheck />
        </CardIcon>
        <CardTitle>Sent to Miles</CardTitle>
        <CardDescription>
          He&apos;ll reply to jane@example.com within one business day. A confirmation is on its way
          to you, and you can keep asking.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <span>Rather talk it through?</span>
        <Button size="clear" variant="link">
          Book a call
          <IconArrowUpRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  ),
}

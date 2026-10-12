import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { UIMessage } from 'ai'
import { expect, waitFor } from 'storybook/test'
import { clearAskHandoff, saveAskHandoff } from '@/features/ask/handoff'
import { stubInquiryIntake } from '@/features/ask/storyPlays'
import { CONTACT_PAGE_DEFAULTS } from '@/shared/content/contact'
import { ContactTemplate } from './ContactTemplate'

type PlayContext = Parameters<NonNullable<StoryObj['play']>>[0]

/**
 * The /contact page: a three-field note to Miles that becomes its own receipt.
 * The route reads the copy from the Contact page global and the address and
 * reply promise from Site Info; here they are the defaults it falls back to.
 * Sending posts to /api/inquiries/submit, stubbed in the stories that send.
 */
const meta = {
  title: 'Features/ContactTemplate',
  component: ContactTemplate,
  parameters: { layout: 'fullscreen' },
  args: {
    copy: { ...CONTACT_PAGE_DEFAULTS },
    email: 'hello@example.com',
    responseTime: 'within 3 business days',
  },
} satisfies Meta<typeof ContactTemplate>

export default meta

type Story = StoryObj<typeof meta>

async function fillAndSend({ canvas, userEvent }: Pick<PlayContext, 'canvas' | 'userEvent'>) {
  await userEvent.type(canvas.getByLabelText('Name'), 'Jordan Lee')
  await userEvent.type(canvas.getByLabelText('Email'), 'jordan@northwind.co')
  await userEvent.type(
    canvas.getByLabelText('Message'),
    'We are hiring a design engineer for our marketing site. Could we talk next week?',
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Send to Miles' }))
}

export const Default: Story = {}

/** No contact address in Site Info: the "Prefer email?" line is left out. */
export const WithoutEmail: Story = {
  args: { email: null },
}

/** Sent empty: every problem is named under its field, and focus goes to the first. */
export const MissingFields: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send to Miles' }))
    await expect(canvas.getByText('Enter your name.')).toBeInTheDocument()
    await expect(canvas.getByText('Add a message for Miles.')).toBeInTheDocument()
    await expect(canvas.getByLabelText('Name')).toHaveFocus()
  },
}

/** Sent: both columns swap in place, the heading thanking the sender and the message read back. */
export const Sent: Story = {
  beforeEach: () => stubInquiryIntake(),
  play: async (context) => {
    await fillAndSend(context)
    await waitFor(
      () =>
        expect(
          context.canvas.getByRole('heading', {
            name: 'Thanks, Jordan. Your message is with Miles.',
          }),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    )
    await expect(context.canvas.getByText('MR-7K2Q')).toBeInTheDocument()
  },
}

/** The intake could not be reached: the message stays, with the way on beside the button. */
export const SendFailed: Story = {
  beforeEach: () => {
    const fetch = window.fetch
    window.fetch = (input, init) =>
      String(input).endsWith('/api/inquiries/submit')
        ? Promise.reject(new TypeError('Failed to fetch'))
        : fetch(input, init)
    return () => {
      window.fetch = fetch
    }
  },
  play: async (context) => {
    await fillAndSend(context)
    await waitFor(() =>
      expect(context.canvas.getByText(/Couldn’t reach the site/)).toBeInTheDocument(),
    )
    await expect(context.canvas.getByLabelText('Message')).toHaveValue(
      'We are hiring a design engineer for our marketing site. Could we talk next week?',
    )
  },
}

const askConversation: UIMessage[] = [
  {
    id: 'question-1',
    role: 'user',
    parts: [{ type: 'text', text: 'What does a website cost, and when can you start?' }],
  },
]

/** Arriving from Ask's "Contact page" link: the visitor's questions open the message, theirs to edit. */
export const FromAsk: Story = {
  beforeEach: () => {
    saveAskHandoff(askConversation, { conversation: 'story-conversation', turn: 'question-1' })
    return clearAskHandoff
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByLabelText<HTMLTextAreaElement>('Message').value).toContain(
        'What does a website cost, and when can you start?',
      ),
    )
    await expect(
      canvas.getByText('Your questions from Ask are included. Edit anything.'),
    ).toBeInTheDocument()
  },
}

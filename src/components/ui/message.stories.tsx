import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bubble, BubbleContent } from './bubble'
import { Message, MessageContent, MessageGroup } from './message'

const questionBody = 'rounded-md rounded-br-xs px-3.5 py-2 text-[0.9375rem]/[1.375rem] md:text-sm/5'
const answerBody = 'text-[0.9375rem]/6 md:text-sm/[1.375rem]'

const meta = {
  title: 'UI/Message',
  component: Message,
  tags: ['autodocs'],
  args: {
    align: 'start',
  },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'end'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Bubble align={args.align} variant="muted">
          <BubbleContent>A message row aligned to its {args.align ?? 'start'} edge.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const End: Story = {
  args: { align: 'end' },
}

/** One Ask exchange: the question at the end in a muted bubble, the answer at the start as plain text. */
export const Conversation: Story = {
  render: () => (
    <MessageGroup className="gap-4">
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent className={questionBody}>
              <p className="whitespace-pre-wrap">Does Miles work with early-stage teams?</p>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="start">
        <MessageContent>
          <Bubble align="start" variant="ghost">
            <BubbleContent className={answerBody}>
              <p className="whitespace-pre-wrap">
                Yes. Most engagements start with a small scoped sprint, then grow into the full site
                or system once the direction is settled.
              </p>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bubble, BubbleContent, BubbleGroup } from './bubble'

const variants = [
  'default',
  'secondary',
  'muted',
  'tinted',
  'outline',
  'ghost',
  'destructive',
] as const

/** Ask's conversation sizes (features/ask/messages): the primitive's 12px is caption scale. */
const questionBody = 'rounded-md rounded-br-xs px-3.5 py-2 text-[0.9375rem]/[1.375rem] md:text-sm/5'
const answerBody = 'text-[0.9375rem]/6 md:text-sm/[1.375rem]'

const meta = {
  title: 'UI/Bubble',
  component: Bubble,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    align: 'start',
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    align: { control: 'inline-radio', options: ['start', 'end'] },
  },
  decorators: [
    (Story) => (
      <div className="flex w-96 flex-col">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>What kind of projects does Miles take on?</BubbleContent>
    </Bubble>
  ),
} satisfies Meta<typeof Bubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The visitor's question in Ask: a quiet bubble whose tail corner points at the field. */
export const Question: Story = {
  args: { align: 'end', variant: 'muted' },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent className={questionBody}>
        <p className="whitespace-pre-wrap">What kind of projects does Miles take on?</p>
      </BubbleContent>
    </Bubble>
  ),
}

/** Ask's answer: `ghost` drops the plate, so the reply reads as the page's voice. */
export const Answer: Story = {
  args: { variant: 'ghost' },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent className={answerBody}>
        <p className="whitespace-pre-wrap">
          Product sites and design systems, mostly for B2B teams. The work page lists recent ones.
        </p>
      </BubbleContent>
    </Bubble>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <BubbleGroup>
      {variants.map((variant, index) => (
        <Bubble align={index % 2 ? 'end' : 'start'} key={variant} variant={variant}>
          <BubbleContent>{variant}</BubbleContent>
        </Bubble>
      ))}
    </BubbleGroup>
  ),
}

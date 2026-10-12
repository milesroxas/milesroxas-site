import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useMemo, useState } from 'react'
import { expect, fn } from 'storybook/test'
import { type AskFeedback, AskFeedbackProvider, type AskRated } from './feedback'
import { AskRating } from './Rating'

const TURN = 'turn-1'

/**
 * The transcript provides the feedback context; here a local one keeps the
 * ratings in state and reports each `rate` call, with nothing posted.
 */
function FeedbackProvider({
  children,
  initial,
  onRate,
}: {
  children: React.ReactNode
  initial?: AskRated
  onRate: AskFeedback['rate']
}) {
  const [ratings, setRatings] = useState<AskFeedback['ratings']>(initial ? { [TURN]: initial } : {})
  const feedback = useMemo<AskFeedback>(
    () => ({
      conversation: 'story',
      ratings,
      rate: (turn, rated) => {
        onRate(turn, rated)
        setRatings((current) => ({ ...current, [turn]: rated }))
      },
      handoff: () => {},
    }),
    [ratings, onRate],
  )
  return <AskFeedbackProvider value={feedback}>{children}</AskFeedbackProvider>
}

type RatingArgs = { initial?: AskRated; onRate: AskFeedback['rate'] }

const Rating = ({ initial, onRate }: RatingArgs) => (
  <FeedbackProvider initial={initial} onRate={onRate}>
    <AskRating turn={TURN} />
  </FeedbackProvider>
)

/**
 * Two thumbs under a settled reply. A choice fills its thumb and hides the
 * other; a thumbs down asks one more question in the same row, and closes
 * once it is answered.
 */
const meta = {
  title: 'Features/Ask/Rating',
  component: Rating,
  parameters: { layout: 'centered' },
  args: { onRate: fn() },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const Unrated: Story = {}

/** Thumbs up is final: the row shows it and offers nothing more. */
export const Helpful: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Helpful' }))
    await expect(args.onRate).toHaveBeenCalledWith(TURN, { rating: 'up' })
    await expect(canvas.getByRole('button', { name: 'Helpful' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  },
}

/** Thumbs down opens the reasons in the same row. */
export const AskingWhy: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Not helpful' }))
    await expect(canvas.getByRole('button', { name: 'Incomplete' })).toBeInTheDocument()
  },
}

/** A reason picked: the follow-up closes, the thumb stays filled. */
export const NotHelpfulWithReason: Story = {
  args: { initial: { rating: 'down', reason: 'incomplete' } },
}

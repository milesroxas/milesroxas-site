import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { Bubble, BubbleContent } from './bubble'
import { Button } from './button'
import { Message, MessageContent } from './message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller'

type Turn = { id: string; role: 'user' | 'assistant'; text: string }

const seed: Turn[] = Array.from({ length: 6 }, (_, index) => [
  { id: `q${index}`, role: 'user' as const, text: `Question ${index + 1}: what about this?` },
  {
    id: `a${index}`,
    role: 'assistant' as const,
    text: 'An answer long enough to wrap onto a second line, so the transcript has some height to scroll through.',
  },
]).flat()

function Transcript({ turns }: { turns: Turn[] }) {
  return turns.map((turn) => (
    <MessageScrollerItem key={turn.id} messageId={turn.id}>
      <Message align={turn.role === 'user' ? 'end' : 'start'}>
        <MessageContent>
          <Bubble
            align={turn.role === 'user' ? 'end' : 'start'}
            variant={turn.role === 'user' ? 'muted' : 'ghost'}
          >
            <BubbleContent className="text-sm/5">{turn.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  ))
}

/** The Ask panel's transcript: follows the bottom as replies land, with a way back down. */
function AskTranscript() {
  const [turns, setTurns] = useState(seed)
  const add = () =>
    setTurns((current) => [
      ...current,
      { id: `r${current.length}`, role: 'assistant', text: `Reply ${current.length + 1}.` },
    ])

  return (
    <div className="flex w-96 flex-col gap-3">
      <div className="h-80 overflow-hidden rounded-lg ring-1 ring-foreground/10">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport aria-label="Transcript">
              <MessageScrollerContent className="gap-4 p-4">
                <Transcript turns={turns} />
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Button className="self-start" onClick={add} variant="outline">
        Add a reply
      </Button>
    </div>
  )
}

const meta = {
  title: 'UI/MessageScroller',
  component: MessageScroller,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MessageScroller>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <AskTranscript />,
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller-viewport"]',
    )
    const button = canvasElement.querySelector<HTMLElement>('[data-slot="message-scroller-button"]')
    if (!viewport || !button) throw new Error('message scroller did not render')
    // Opens at the end, so the way down rests hidden.
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0))
    await waitFor(() => expect(button).toHaveAttribute('data-active', 'false'))
    // A wheel marks the scroll as the reader's, so auto-scroll lets go.
    fireEvent.wheel(viewport, { deltaY: -400 })
    viewport.scrollTo({ top: 0 })
    await waitFor(() => expect(button).toHaveAttribute('data-active', 'true'))
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('data-active', 'false'), { timeout: 3000 })
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add a reply' }))
    await waitFor(() => expect(button).toHaveAttribute('data-active', 'false'))
  },
}

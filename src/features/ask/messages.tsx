'use client'

import type { ChatStatus } from 'ai'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'
import { MessageScrollerItem } from '@/components/ui/message-scroller'
import { cn } from '@/utilities/ui'
import { ASK_READING } from './copy'
import { type AskFeedback, AskFeedbackProvider } from './feedback'
import { type AskHandoffReceipt, type AskHandoffSent, Handoff } from './HandoffPanel'
import {
  ASK_HANDOFFS,
  type AskHandoff,
  type AskHandoffTerms,
  type AskUIMessage,
  handoffOf,
} from './handoff'
import { messageText } from './messageText'
import { handoffAfterLead, transcriptItemEnter } from './motion'
import { AskRating } from './Rating'
import { ASK_NOTICE } from './retention'
import { AskSources } from './Sources'

/**
 * Shared transcript pieces for every Ask surface (the dock's panel and sheet,
 * and the /ask page widget) so message rendering and error unwrapping stay
 * identical.
 */

export function errorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // not a JSON error body; fall through
  }
  return error.message || 'Something went wrong. Try again.'
}

/**
 * Something to read yet. While a reply streams only its words count: its
 * handoff, like its sources, lands once the reply settles, so it closes the
 * answer instead of being written over by it.
 */
const hasReply = (message: AskUIMessage, live: boolean) =>
  messageText(message) !== '' || (!live && handoffOf(message) !== null)

type TranscriptItemsProps = {
  messages: AskUIMessage[]
  status: ChatStatus
  /** Open with the AI notice. Off where the surface states it under its field (the phone sheet). */
  notice?: boolean
  /**
   * Pin each new question to the top of the scroller, as a page-length
   * transcript reads. Off where the transcript grows up out of its field
   * (the dock's panel and sheet): it follows the bottom, as Messages does,
   * so a short reply never leaves a reserved gap under it.
   */
  anchorQuestions?: boolean
  /** Site Info's promise, for the quiet offer that carries no resolved handoff of its own. */
  terms: AskHandoffTerms
  /** The handoff the visitor has sent in this conversation, if any. */
  sent: AskHandoffSent | null
  onSent: (messageId: string, receipt: AskHandoffReceipt) => void
  feedback: AskFeedback
}

/**
 * The transcript body shared by every Ask surface: the message list, the
 * Thinking shimmer while a reply is pending, and the way to a person once it
 * has settled. Renders inside a MessageScrollerContent.
 *
 * "Pending" covers the whole wait for something to read, not just
 * `submitted`: the stream opens with source parts before the model has said
 * anything, and an assistant message with nothing to read yet is held back
 * (the shimmer stays) rather than mounted as an empty bubble. It joins the
 * transcript with its first delta, or, when the handoff is the whole reply,
 * with the reason's lead line as the reply settles.
 *
 * One handoff per conversation. The reply that ends the transcript, once
 * settled, closes with the offer (the model's reason, or the quiet `none`
 * one), rendered as its own item after the words and the sources; a reply
 * that settled with nothing to read gets the quiet offer alone. A newer
 * reply takes the offer with it; an earlier reply's lead line stays, since
 * it was the reply. Once the visitor has sent, the receipt stays pinned to
 * the reply it closed and no later reply offers again.
 *
 * Every settled reply can be rated. The rating and the handoff are filed
 * under the question's own message id (`feedback`), which the transcript
 * provides to both so neither needs the row it lands in.
 */
export function TranscriptItems({
  messages,
  status,
  terms,
  sent,
  onSent,
  feedback,
  notice = true,
  anchorQuestions = true,
}: TranscriptItemsProps) {
  const last = messages.at(-1)
  const lastIsAssistant = last?.role === 'assistant'
  const awaitingReply = lastIsAssistant && !hasReply(last, status === 'streaming')
  // A reply still on its way is held back (the shimmer stays for it). One
  // that settled with nothing to read (a tool call the schema refused, an
  // answer cut to nothing) stays in, so the quiet offer can close it and
  // there is always a way forward.
  const visible = awaitingReply && status !== 'ready' ? messages.slice(0, -1) : messages
  const pending = status === 'submitted' || (status === 'streaming' && awaitingReply)
  // The way to a person waits for a finished answer: offering it mid-stream
  // would pull the eye off the reply being read.
  const settled = status === 'ready' && lastIsAssistant

  return (
    <AskFeedbackProvider value={feedback}>
      {notice && visible.length > 0 && (
        <MessageScrollerItem messageId="ask-notice">
          <p className={`text-muted-foreground text-xs/4 ${transcriptItemEnter}`}>{ASK_NOTICE}</p>
        </MessageScrollerItem>
      )}
      {visible.map((message, index) => (
        <TranscriptTurn
          closes={settled && !sent && index === visible.length - 1}
          anchor={anchorQuestions}
          key={message.id}
          live={status === 'streaming' && index === visible.length - 1}
          message={message}
          messages={messages}
          onSent={onSent}
          previous={visible[index - 1]}
          sent={sent}
          terms={terms}
        />
      ))}
      {pending && <PendingItem />}
    </AskFeedbackProvider>
  )
}

/** The Thinking shimmer, held while a reply has nothing to read yet. */
function PendingItem() {
  return (
    <MessageScrollerItem messageId="pending">
      <p
        className={`flex items-center gap-2.5 text-muted-foreground text-sm/5 ${transcriptItemEnter}`}
        role="status"
      >
        <span aria-hidden className="ask-reading">
          <span />
          <span />
          <span />
        </span>
        {ASK_READING}
      </p>
    </MessageScrollerItem>
  )
}

type TurnHandoffProps = {
  messages: AskUIMessage[]
  sent: AskHandoffSent | null
  terms: AskHandoffTerms
  onSent: (messageId: string, receipt: AskHandoffReceipt) => void
}

/**
 * One message and what closes it: the bubble (or a handoff-only reply's lead
 * line), the rating, and the handoff when this reply ends the transcript or
 * was the one sent from. `previous` is the message before it, which for a
 * reply is the question it answers and the turn its feedback files under.
 */
function TranscriptTurn({
  message,
  previous,
  anchor,
  live,
  closes,
  ...handoffProps
}: TurnHandoffProps & {
  message: AskUIMessage
  previous: AskUIMessage | undefined
  /** A question pins itself to the scroller's top as it lands. */
  anchor: boolean
  /** Still receiving deltas. */
  live: boolean
  /** The settled reply that ends the transcript, with nothing sent yet. */
  closes: boolean
}) {
  const reply = message.role === 'assistant' && !live
  const text = messageText(message)
  const handoff = reply ? handoffOf(message) : null
  const lead = handoff && text === '' ? ASK_HANDOFFS[handoff.reason].lead : null
  const turn = reply && previous?.role === 'user' ? previous.id : null
  const sentHere = handoffProps.sent?.messageId === message.id
  const offersHandoff = sentHere || (closes && reply)
  const footId = `${message.id}:foot`

  return (
    <>
      {text !== '' && (
        <MessageScrollerItem
          messageId={message.id}
          scrollAnchor={anchor && message.role === 'user'}
        >
          <AskMessage message={message} streaming={live} />
        </MessageScrollerItem>
      )}
      {lead && (
        <MessageScrollerItem messageId={`${message.id}:lead`}>
          <AskReply>{lead}</AskReply>
        </MessageScrollerItem>
      )}
      {(turn || offersHandoff) && (
        <MessageScrollerItem messageId={footId}>
          <TurnFoot
            footId={footId}
            handoff={handoff}
            leadOnly={lead !== null}
            messageId={message.id}
            offersHandoff={offersHandoff}
            sentHere={sentHere}
            turn={turn}
            {...handoffProps}
          />
        </MessageScrollerItem>
      )}
    </>
  )
}

/**
 * The reply's foot: the rating at the start, the way to Miles at the end, on
 * one row. Once the offer opens into its form or its receipt, that takes the
 * row's full width under the rating.
 */
function TurnFoot({
  footId,
  messageId,
  turn,
  handoff,
  leadOnly,
  offersHandoff,
  sentHere,
  messages,
  sent,
  terms,
  onSent,
}: TurnHandoffProps & {
  footId: string
  messageId: string
  turn: string | null
  handoff: AskHandoff | null
  /** The handoff is the whole reply, after its lead line. */
  leadOnly: boolean
  offersHandoff: boolean
  sentHere: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      {/* A handoff-only reply has no answer to rate: its handoff
          signal records how the visitor took it. */}
      {turn && !leadOnly && (
        <div className={transcriptItemEnter}>
          <AskRating turn={turn} />
        </div>
      )}
      {offersHandoff && (
        <div
          className={cn(
            'ml-auto has-[[data-panel=form],[data-panel=sent]]:ml-0 has-[[data-panel=form],[data-panel=sent]]:basis-full',
            transcriptItemEnter,
            leadOnly && ['ml-0 basis-full', handoffAfterLead],
          )}
        >
          <Handoff
            itemId={footId}
            kind={handoff?.reason ?? 'none'}
            messages={messages}
            onSent={(receipt) => onSent(messageId, receipt)}
            prominent={leadOnly}
            receipt={sentHere && sent ? sent.receipt : null}
            terms={handoff ?? terms}
            turn={turn}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Conversation text at 15px on a phone and 14px from md: the primitives' 12px
 * is caption scale, too small for a conversation. The visitor's question sits
 * in a quiet bubble whose tail corner points at the field it came from; the
 * answer is plain text on the panel, so it reads as the page's voice rather
 * than a chat partner's.
 */
const answerBody = 'text-[0.9375rem]/6 md:text-sm/[1.375rem]'
const questionBody = 'rounded-md rounded-br-xs px-3.5 py-2 text-[0.9375rem]/[1.375rem] md:text-sm/5'

/** The assistant's words with no message of their own: a handoff's lead line. */
function AskReply({ children }: { children: string }) {
  return (
    <Message align="start" className={transcriptItemEnter}>
      <MessageContent>
        <Bubble align="start" variant="ghost">
          <BubbleContent className={answerBody}>
            <p className="whitespace-pre-wrap">{children}</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

/**
 * One message: the bubble, and under an assistant's answer the pages it
 * drew on. Those land after the answer, never before it: /api/ask streams
 * the matched documents ahead of the first token, so rendered as they arrive
 * they would head an empty bubble and then be pushed down by every delta.
 * The group rises in once the answer settles.
 */
function AskMessage({
  message,
  streaming = false,
}: {
  message: AskUIMessage
  /** This message is still receiving deltas: hold its sources until it settles. */
  streaming?: boolean
}) {
  const isUser = message.role === 'user'
  const sources =
    isUser || streaming
      ? []
      : message.parts.filter(
          (part): part is Extract<typeof part, { type: 'source-url' }> =>
            part.type === 'source-url',
        )

  return (
    <Message align={isUser ? 'end' : 'start'} className={transcriptItemEnter}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'muted' : 'ghost'}>
          <BubbleContent className={isUser ? questionBody : answerBody}>
            <p className="whitespace-pre-wrap">{messageText(message)}</p>
          </BubbleContent>
        </Bubble>
        {sources.length > 0 && (
          <div className={transcriptItemEnter}>
            <AskSources sources={sources} />
          </div>
        )}
      </MessageContent>
    </Message>
  )
}

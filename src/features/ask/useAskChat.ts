'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport, generateId } from 'ai'
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAskSession } from './AskSession'
import { type AskFeedback, type AskRated, postAskFeedback } from './feedback'
import type { AskHandoffReceipt, AskHandoffSent } from './HandoffPanel'
import { type AskUIMessage, askHandoffState } from './handoff'
import { messageText } from './messageText'
import { ASK_QUESTION_LENGTH, type AskHandoffSignal } from './vocabulary'

type UseAskChatOptions = {
  /** Transport override: stories and tests script the chat without /api/ask. */
  transport?: ChatTransport<AskUIMessage>
  /** Seed the transcript, e.g. for stories or resuming a conversation. */
  initialMessages?: AskUIMessage[]
  /** Runs after a question is accepted and sent (e.g. reveal the transcript). */
  onSend?: () => void
}

/**
 * Chat wiring shared by every Ask surface (the dock's panel and sheet, the
 * /ask page widget): the /api/ask transport default, busy state, the
 * min-length-guarded submit that clears the composer, `stop` for the
 * composer's in-flight Stop button, the one handoff the conversation can
 * send, and the visitor's feedback on each turn.
 *
 * On the site every surface reads the one conversation in `AskSession`, so
 * a question asked in the dock is on the /ask page's transcript too, in
 * the same chat in the log; only the composer's draft and `onSend` are the
 * surface's own. A scripted surface (a `transport` or a seeded transcript:
 * stories and tests) and anything outside the provider keeps a chat to itself.
 *
 * Every request carries where the conversation stands with the team
 * (`handoff`: none, offered, sent) next to the page it was asked on, so the
 * endpoint can keep the model from offering twice and drop the offer
 * entirely once the visitor has sent.
 */
export function useAskChat({ transport, initialMessages, onSend }: UseAskChatOptions) {
  const session = useAskSession()
  const shared = transport || initialMessages ? null : session
  const [question, setQuestion] = useState('')
  const { sent, markSent, ratings, setRatings, clearOwn } = useSentAndRatings(shared)
  const { messages, sendMessage, setMessages, status, error, stop, id, restartOwn } = useChatFor({
    shared,
    transport,
    initialMessages,
  })

  useReturnFailedQuestion({ messages, error, setMessages, setQuestion })

  const busy = status === 'submitted' || status === 'streaming'
  const canSend = !busy && question.trim().length >= ASK_QUESTION_LENGTH.min

  function sendQuestion(text: string) {
    const trimmed = text.trim()
    if (trimmed.length < ASK_QUESTION_LENGTH.min || busy) return
    // Where the conversation stands with the team as this question leaves,
    // merged into the transport's body beside `pagePath`.
    void sendMessage(
      { text: trimmed },
      { body: { handoff: askHandoffState(messages, sent !== null) } },
    )
    setQuestion('')
    onSend?.()
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendQuestion(question)
  }

  /** A new conversation: the transcript, what it sent, and what it rated go together. */
  function reset() {
    if (shared) return shared.reset()
    restartOwn()
    clearOwn()
  }

  const feedback = useTurnFeedback(id, ratings, setRatings)

  return {
    question,
    setQuestion,
    messages,
    status,
    error,
    busy,
    canSend,
    submit,
    sendQuestion,
    stop,
    sent,
    markSent,
    reset,
    feedback,
  }
}

type AskSession = NonNullable<ReturnType<typeof useAskSession>>

/** What the conversation sent and rated: the session's on the site, else the chat's own. */
function useSentAndRatings(shared: AskSession | null) {
  const [ownSent, setOwnSent] = useState<AskHandoffSent | null>(null)
  const [ownRatings, setOwnRatings] = useState<AskFeedback['ratings']>({})
  const { sent, setSent, ratings, setRatings } = shared ?? {
    sent: ownSent,
    setSent: setOwnSent,
    ratings: ownRatings,
    setRatings: setOwnRatings,
  }
  /** The visitor sent their details from the handoff under `messageId`. */
  const markSent = (messageId: string, receipt: AskHandoffReceipt) => {
    setSent({ messageId, receipt })
  }
  const clearOwn = () => {
    setOwnSent(null)
    setOwnRatings({})
  }
  return { sent, markSent, ratings, setRatings, clearOwn }
}

/**
 * The session's chat on the site, else one of its own. The chat id files
 * every turn of one conversation; a reset mints a new one (which is also
 * what empties the transcript) so two conversations from one open box never
 * share a thread in the log. The seed is spent on the first chat only.
 */
function useChatFor({
  shared,
  transport,
  initialMessages,
}: {
  shared: AskSession | null
  transport?: ChatTransport<AskUIMessage>
  initialMessages?: AskUIMessage[]
}) {
  const [ownId, setOwnId] = useState(generateId)
  const [seed, setSeed] = useState(initialMessages)
  const chatTransport = useMemo(
    () =>
      transport ??
      new DefaultChatTransport<AskUIMessage>({
        api: '/api/ask',
        // Resolved per request, so it is the page the question was asked on
        // even after client-side navigation. Stored with the question.
        body: () => ({ pagePath: window.location.pathname }),
      }),
    [transport],
  )
  const { messages, sendMessage, setMessages, status, error, stop } = useChat<AskUIMessage>(
    shared ? { chat: shared.chat } : { id: ownId, transport: chatTransport, messages: seed },
  )
  const restartOwn = () => {
    setOwnId(generateId())
    setSeed(undefined)
  }
  return {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    stop,
    id: shared ? shared.chat.id : ownId,
    restartOwn,
  }
}

/**
 * A question that failed before any reply began (rate limit, network) goes
 * back into the composer instead of staying in the transcript as a question
 * nobody answered: the visitor sends it again as it was, and the log never
 * holds it twice. Read from a ref so only a new error runs it; a surface
 * that shares the chat and runs it second finds the reply-less question
 * already gone and leaves the transcript alone.
 */
function useReturnFailedQuestion({
  messages,
  error,
  setMessages,
  setQuestion,
}: {
  messages: AskUIMessage[]
  error: Error | undefined
  setMessages: (messages: AskUIMessage[]) => void
  setQuestion: Dispatch<SetStateAction<string>>
}) {
  const latest = useRef(messages)
  latest.current = messages
  useEffect(() => {
    if (!error) return
    const current = latest.current
    const last = current.at(-1)
    if (last?.role !== 'user') return
    setMessages(current.slice(0, -1))
    setQuestion((draft) => draft || messageText(last))
  }, [error, setMessages, setQuestion])
}

/**
 * The visitor's feedback on each turn. Shown at once and posted behind it;
 * the server keeps the first rating (a reason may follow it) and the
 * strongest handoff signal, so a repeat changes nothing there. Memoized: it
 * is a context value read by every rating control in the transcript.
 */
function useTurnFeedback(
  id: string,
  ratings: AskFeedback['ratings'],
  setRatings: Dispatch<SetStateAction<AskFeedback['ratings']>>,
): AskFeedback {
  const rate = useCallback(
    (turn: string, rated: AskRated) => {
      setRatings((current) => ({ ...current, [turn]: rated }))
      postAskFeedback({ id, turn, rating: rated.rating, reason: rated.reason })
    },
    [id, setRatings],
  )
  const handoff = useCallback(
    (turn: string, signal: AskHandoffSignal) => postAskFeedback({ id, turn, handoff: signal }),
    [id],
  )
  return useMemo<AskFeedback>(
    () => ({ conversation: id, ratings, rate, handoff }),
    [id, ratings, rate, handoff],
  )
}

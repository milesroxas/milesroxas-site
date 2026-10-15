'use client'

import type { Chat } from '@ai-sdk/react'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSitePathname } from '@/hooks/use-site-pathname'
import { whenIdle } from '@/utilities/whenIdle'
import type { AskFeedback } from './feedback'
import type { AskHandoffSent } from './HandoffPanel'
import type { AskUIMessage } from './handoff'
import {
  type AskJourneyOpenVisit,
  type AskJourneyVisit,
  journeyDigest,
  openVisitSeconds,
} from './journey'

/**
 * One Ask conversation for the whole site. The takeover menu, the closing
 * band and the /ask page each used to mount their own chat, so a question
 * asked in the menu was unknown to the band under the same page. They now
 * read this session: one transcript, one chat id in the log, one handoff, one
 * set of ratings, whichever surface the visitor picks up next. It sits in the
 * root providers, above the header and every page, so it survives client-side
 * navigation; a full reload starts a new conversation, as before.
 *
 * It also keeps the visitor's journey (journey.ts) and sends it beside every
 * question, with the page the question was asked on, so the endpoint knows
 * where the visitor is and what they have been reading.
 */
type AskSession = {
  chat: Chat<AskUIMessage>
  sent: AskHandoffSent | null
  setSent: (sent: AskHandoffSent | null) => void
  ratings: AskFeedback['ratings']
  setRatings: React.Dispatch<React.SetStateAction<AskFeedback['ratings']>>
  /** A new conversation: a new chat id, an empty transcript, nothing sent or rated. The journey stays. */
  reset: () => void
}

const AskSessionContext = createContext<AskSession | null>(null)

/**
 * The site's one conversation; null outside the provider (stories, tests,
 * the admin) and until the runtime below has arrived.
 */
export const useAskSession = (): AskSession | null => use(AskSessionContext)

/** Whether the conversation exists yet: a surface that reads it mounts once this is true. */
export const useAskReady = (): boolean => use(AskSessionContext) !== null

type AskRuntime = {
  Chat: typeof import('@ai-sdk/react').Chat
  DefaultChatTransport: typeof import('ai').DefaultChatTransport
  generateId: typeof import('ai').generateId
}

let runtimePromise: Promise<AskRuntime> | undefined

/**
 * The chat runtime (the AI SDK and the schema library under it), fetched
 * once. A static import put it in the chunk every page waits on, for a
 * panel most visits never open; the provider asks for it once the page is
 * idle, and a surface that needs it sooner can ask here.
 */
export const loadAskRuntime = (): Promise<AskRuntime> => {
  runtimePromise ??= Promise.all([import('@ai-sdk/react'), import('ai')]).then(([react, ai]) => ({
    Chat: react.Chat,
    DefaultChatTransport: ai.DefaultChatTransport,
    generateId: ai.generateId,
  }))
  return runtimePromise
}

function useAskRuntime(): AskRuntime | null {
  const [runtime, setRuntime] = useState<AskRuntime | null>(null)
  useEffect(() => {
    let cancelled = false
    const cancelIdle = whenIdle(() => {
      loadAskRuntime().then((loaded) => {
        if (!cancelled) setRuntime(loaded)
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [])
  return runtime
}

const scrollDepth = (): number => {
  const { scrollHeight } = document.documentElement
  if (scrollHeight <= 0) return 0
  return Math.min(100, ((window.scrollY + window.innerHeight) / scrollHeight) * 100)
}

/**
 * The journey, kept in refs: it changes on every scroll and must never render
 * anything. Time counts only while the tab is visible.
 */
function useAskJourney(): () => AskJourneyVisit[] {
  const pathname = useSitePathname()
  const closed = useRef(new Map<string, AskJourneyVisit>())
  const open = useRef<AskJourneyOpenVisit | null>(null)

  useEffect(() => {
    const visible = document.visibilityState === 'visible'
    open.current = { path: pathname, seconds: 0, depth: 0, since: visible ? Date.now() : null }
    return () => {
      const visit = open.current
      if (!visit) return
      const earlier = closed.current.get(visit.path)
      // Re-inserted so the map's order is the order pages were last seen in.
      closed.current.delete(visit.path)
      closed.current.set(visit.path, {
        path: visit.path,
        seconds: (earlier?.seconds ?? 0) + openVisitSeconds(visit, Date.now()),
        depth: Math.max(earlier?.depth ?? 0, visit.depth),
      })
      open.current = null
    }
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const visit = open.current
      if (visit) visit.depth = Math.max(visit.depth, scrollDepth())
    }
    const onVisibility = () => {
      const visit = open.current
      if (!visit) return
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        visit.since ??= now
      } else {
        visit.seconds = openVisitSeconds(visit, now)
        visit.since = null
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return useCallback(() => journeyDigest(closed.current.values(), open.current, Date.now()), [])
}

export function AskSessionProvider({ children }: { children: React.ReactNode }) {
  const journey = useAskJourney()
  const runtime = useAskRuntime()
  const newChat = useCallback(() => {
    if (!runtime) return null
    const transport = new runtime.DefaultChatTransport<AskUIMessage>({
      api: '/api/ask',
      // Resolved per request, so it is the page the question was asked on
      // even after client-side navigation, and the journey up to that moment.
      body: () => ({ pagePath: window.location.pathname, journey: journey() }),
    })
    return new runtime.Chat<AskUIMessage>({ id: runtime.generateId(), transport })
  }, [runtime, journey])
  const [chat, setChat] = useState<Chat<AskUIMessage> | null>(null)
  // The first conversation, the render the runtime lands.
  if (chat === null && runtime) setChat(newChat())
  const [sent, setSent] = useState<AskHandoffSent | null>(null)
  const [ratings, setRatings] = useState<AskFeedback['ratings']>({})

  const reset = useCallback(() => {
    setChat(newChat())
    setSent(null)
    setRatings({})
  }, [newChat])

  const session = useMemo<AskSession | null>(
    () => chat && { chat, sent, setSent, ratings, setRatings, reset },
    [chat, sent, ratings, reset],
  )

  return <AskSessionContext value={session}>{children}</AskSessionContext>
}

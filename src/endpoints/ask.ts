import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type ModelMessage,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai'
import type { Endpoint, PayloadRequest } from 'payload'
import { backfillAskIndex, isBackfillRunning, readLastIndexRebuild } from '@/features/ask/backfill'
import {
  ASK_HANDOFF_STATES,
  type AskHandoff,
  type AskHandoffReason,
  type AskHandoffState,
  type AskUIMessage,
} from '@/features/ask/handoff'
import { askHandoffTool, resolveAskHandoff } from '@/features/ask/handoffTool'
import { askHistory } from '@/features/ask/history'
import { journeyFrom } from '@/features/ask/journey'
import {
  type AskJourneyContext,
  type AskJourneyPage,
  EMPTY_JOURNEY,
  resolveJourney,
} from '@/features/ask/journeyPages'
import {
  type AskJudgeMode,
  type AskPassage,
  type AskPassageJudgment,
  type AskTurnJudgment,
  type AskTurnRoute,
  askJudgeMode,
  dependsOnPrevious,
  judgePassages,
  judgeTurn,
  leansOnPage,
  routeCardReason,
  routePassage,
  routeTurn,
} from '@/features/ask/judge'
import { messageText } from '@/features/ask/messageText'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { askSystemPrompt, offersAskHandoff } from '@/features/ask/prompts'
import {
  type AskTurnRecord,
  askIdFrom,
  markAskTurn,
  pagePathFrom,
  recordAskQuestion,
} from '@/features/ask/questions'
import { hasIdentifyingNumber } from '@/features/ask/redact'
import {
  type PassageCheck,
  type PreparedRetrieval,
  pageRetrievalQuery,
  prepareRetrieval,
  type RetrievedSource,
  retrievalQueries,
} from '@/features/ask/retrieve'
import {
  type AskStoryBrief,
  namesStory,
  resolveStoryBrief,
  withStoryBrief,
} from '@/features/ask/storyBrief'
import {
  isUsageConfigured,
  OPENAI_ADMIN_KEY_VAR,
  OpenAIAdminError,
  readUsageReport,
  refreshUsageReport,
} from '@/features/ask/usage'
import {
  ASK_MAX_MESSAGES,
  ASK_QUESTION_LENGTH,
  ASK_RATING_REASONS,
  ASK_RATINGS,
  type AskOutcome,
  type AskRetrievalPath,
  askOutcome,
} from '@/features/ask/vocabulary'
import type { SiteInfo } from '@/payload-types'
import { isOption } from '@/shared/content/options'
import { afterResponse } from '@/utilities/afterResponse'
import { findEmailAddress } from '@/utilities/emailAddress'
import { captureServerEvent } from '@/utilities/posthog-server'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * Speaks the AI SDK UI-message-stream protocol so the widget drives it with
 * `useChat`: embedding retrieval over the content corpus → matched documents
 * streamed back as source-url parts, followed by a grounded answer from the
 * model with those documents as the only allowed context. The model answers
 * in the studio's voice, gives partial answers when the sources only half
 * cover a question, and never invents facts. When a person is the better next
 * step it calls the `handoff` tool, and the card it shows is worded in code
 * and filled from Site Info (src/features/ask/handoffTool.ts). Token
 * discipline: a first-turn question with no matching sources gets that card
 * (`no_answer`) with no model call; only follow-up turns reach the model
 * source-less (so "thanks" or "say that again" stay conversational) and those
 * run under a tight output cap.
 *
 * The judge (src/features/ask/judge.ts, `ASK_JEV`): `off` is the path above,
 * unchanged. `shadow` runs Jev beside it and measures, deciding nothing.
 * `on` moves the decisions out of the writing model: contact details are
 * found by a regex, Jev classifies the turn while the query is embedded, a
 * card-only turn is answered with no retrieval and no model, retrieved
 * passages are vetted before they become sources, and the model writes with
 * no tool while code appends the card. A failed or unsure judgment is the
 * path above, so a visitor never sees a Jev error.
 *
 * A thin case study (src/features/ask/storyBrief.ts, mode `on`): a question
 * about the work page it was asked on, where the case study's story is not
 * written yet, is answered from the record's brief (the client, the kinds of
 * work, the summary) and closes with the `case_study` card, which says the
 * story is on its way and offers a partner to walk through it.
 */

/** Output budget per answer; includes gpt-5 reasoning tokens, so leave headroom over the ~120-word answer. */
const MAX_ANSWER_TOKENS = 1_200
/**
 * Output budget for a turn the judge routed: no tool and minimal reasoning, so
 * the budget is the words alone. Measured 2026-09-19 over 43 such answers: 180
 * tokens at most, 115 at the median.
 */
const MAX_WRITING_TOKENS = 400
/** Source-less follow-up turns are conversational only (a thanks, a rephrase), so cap them hard. */
const MAX_CHAT_ONLY_TOKENS = 400

/**
 * Reasoning effort for the writing model. With the tool on offer it also
 * judges (is a person the next step, do the sources answer this), which is
 * what `low` was tuned for. A routed turn has had those decisions made and
 * its passages vetted, so the model only writes: `minimal` spends no
 * reasoning tokens and took the median time to first word from 4.7 s to
 * 1.5 s with cards and sources unchanged (docs/perf/ask-jev/report.md).
 * Rollback is this one value.
 */
const REASONING_EFFORT = { deciding: 'low', writing: 'minimal' } as const

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * Fixed-window in-memory limiter, one budget per public route so feedback
 * taps never spend the question allowance. On serverless this is per warm
 * instance, so it's a cost fuse against naive abuse, not a hard guarantee;
 * acceptable for an MVP; move to a shared store if the endpoint ever draws
 * real traffic.
 */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(req: PayloadRequest, route: string): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

const RATE_LIMITED = 'Too many questions, try again in a minute.'

/** The user turn before the current one, or null on a first turn. */
function previousUserQuestion(messages: UIMessage[]): string | null {
  const previousUser = messages
    .slice(0, -1)
    .filter((message) => message.role === 'user')
    .at(-1)
  return previousUser ? messageText(previousUser).trim() || null : null
}

/** Escapes the attribute values interpolated into the source tags. */
function attr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

/**
 * Streams a handoff card as the whole reply, without a model call: the same
 * `tool-handoff` part the model's own tool call produces, so the client has
 * one way to render it.
 */
function handoffResponse(handoff: AskHandoff): Response {
  const stream = createUIMessageStream<AskUIMessage>({
    execute: ({ writer }) => {
      writer.write({ type: 'start' })
      writeHandoff(writer, handoff)
      writer.write({ type: 'finish' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

/** The `tool-handoff` part as the model's own tool call would stream it, written by code. */
function writeHandoff(writer: UIMessageStreamWriter<AskUIMessage>, handoff: AskHandoff): void {
  const toolCallId = generateId()
  writer.write({
    type: 'tool-input-available',
    toolCallId,
    toolName: 'handoff',
    input: { reason: handoff.reason },
  })
  writer.write({ type: 'tool-output-available', toolCallId, output: handoff })
}

/**
 * The card a route would have ended in, for shadow mode's agreement rate: its
 * own reason, or for an evidence route left with nothing to ground on (the
 * passage check kept nothing, or nothing was retrieved to check) the card
 * that stands in for the answer.
 */
function shadowCard(route: AskTurnRoute, grounded: boolean): AskHandoffReason | null {
  if (route.kind === 'evidence' && !grounded) return route.reason ?? 'no_answer'
  return routeCardReason(route)
}

/**
 * The card a grounded, routed reply closes with. The turn's own reason comes
 * first: a visitor pricing their project on a thin case study is still an
 * estimate. A turn with none, answered from a thin story's brief, closes with
 * the offer to be walked through it.
 */
function closingCardReason(
  route: AskTurnRoute,
  { thinStory, mayOffer }: { thinStory: boolean; mayOffer: boolean },
): AskHandoffReason | null {
  return routeCardReason(route) ?? (thinStory && mayOffer ? 'case_study' : null)
}

type AskBody = {
  messages?: unknown
  id?: unknown
  pagePath?: unknown
  handoff?: unknown
  journey?: unknown
} | null

/** A request that holds a question: a conversation ending in a user turn of allowed length. */
type AskInput = {
  body: AskBody
  messages: UIMessage[]
  lastMessage: UIMessage
  question: string
  handoffState: AskHandoffState
}

/**
 * What the judge saw and did this turn, for the log line and PostHog:
 * metadata only, never the question and never a probability beside it.
 */
type JudgedTurn = {
  turn: Promise<AskTurnJudgment | null> | null
  judgment: AskTurnJudgment | null
  route: AskTurnRoute | null
  /** One check per query form searched: two when the page form rides beside the plain one. */
  passages: Promise<AskPassageJudgment | null>[]
  chunksKept: number | null
  firstOutputMs: number | null
  modelSkipped: boolean
  pageAttached: boolean
  /** The turn was answered from a thin case study's brief. */
  thinStory: boolean
}

/**
 * One turn as the handler carries it: what the request said, and what the
 * judge and retrieval have found so far. The recorder reads it whenever the
 * turn closes, so the steps fill it in as they go.
 */
type AskTurn = {
  req: PayloadRequest
  siteInfo: SiteInfo
  messages: UIMessage[]
  question: string
  /** The user message's id: how the visitor's later feedback finds this turn's row. */
  turnId: string
  conversation: string | null
  pagePath: string | null
  isFollowUp: boolean
  previousQuestion: string | null
  handoffState: AskHandoffState
  mode: AskJudgeMode
  journey: AskJourneyContext
  /** The page the question was asked on, when it is about one thing a question can lean on. */
  subjectPage: AskJourneyPage | null
  /**
   * What the record behind that page can say when its story is thin, read
   * while Jev and the embedding are in flight. Null for any page but a work page.
   */
  storyBrief: Promise<AskStoryBrief | null> | null
  hasContactDetails: boolean
  startedAt: number
  judged: JudgedTurn
  sources: RetrievedSource[]
  retrieval: AskRetrievalPath
  chunkCandidates: number
  /** One row and one event per turn, whichever callback closes it. */
  recorded: boolean
}

/** How a turn closed, as its row records it. */
type AskTurnClose = Pick<
  AskTurnRecord,
  'answer' | 'outcome' | 'handoffReason' | 'inputTokens' | 'outputTokens'
>

/** A request turned away before its body is read: Ask hidden, not configured, or rate limited. */
function refuseAsk(req: PayloadRequest, siteInfo: SiteInfo): Response | null {
  if (siteInfo.ask?.hidden) {
    return json({ error: 'Ask is turned off on this site.' }, 404)
  }

  if (!process.env[ASK_MODEL_API_KEY_VAR]) {
    req.payload.logger.error(`Ask endpoint disabled: ${ASK_MODEL_API_KEY_VAR} is not set.`)
    return json({ error: 'Ask is not configured on this site yet.' }, 503)
  }

  if (isRateLimited(req, 'ask')) return json({ error: RATE_LIMITED }, 429)
  return null
}

/**
 * The question and the conversation it closes, or the 400 that refuses them.
 * `id` is the AI SDK chat id and `pagePath` the page the composer sits on
 * (see useAskChat); both are kept only if well formed. `handoff` is where
 * the conversation stands with the team; an unknown value reads as none,
 * the state that changes nothing.
 */
async function readAskInput(req: PayloadRequest): Promise<AskInput | Response> {
  const body = (await req.json?.().catch(() => null)) as AskBody
  const rawMessages = Array.isArray(body?.messages) ? (body.messages as UIMessage[]) : []
  const messages = rawMessages.length <= ASK_MAX_MESSAGES ? askHistory(rawMessages) : null
  const lastMessage = messages?.at(-1)
  const handoffState: AskHandoffState = ASK_HANDOFF_STATES.includes(
    body?.handoff as AskHandoffState,
  )
    ? (body?.handoff as AskHandoffState)
    : 'none'

  if (!messages || lastMessage?.role !== 'user') {
    return json({ error: 'Send a conversation ending in a user question.' }, 400)
  }

  const question = messageText(lastMessage).trim()
  if (question.length < ASK_QUESTION_LENGTH.min || question.length > ASK_QUESTION_LENGTH.max) {
    return json(
      {
        error: `Question must be between ${ASK_QUESTION_LENGTH.min} and ${ASK_QUESTION_LENGTH.max} characters.`,
      },
      400,
    )
  }

  return { body, messages, lastMessage, question, handoffState }
}

/** The turn as the request describes it, before the judge or retrieval has a say. */
async function openTurn(
  req: PayloadRequest,
  siteInfo: SiteInfo,
  input: AskInput,
): Promise<AskTurn> {
  const { body, messages, question, handoffState } = input
  const startedAt = Date.now()
  const pagePath = pagePathFrom(body?.pagePath)
  const mode = askJudgeMode()
  // Where the visitor is and what they have read (journey.ts), in the
  // index's own words. Off reads none of it: off is the path as it was.
  const journey =
    mode === 'off'
      ? EMPTY_JOURNEY
      : await resolveJourney(req.payload, journeyFrom(body?.journey), pagePath)
  const subjectPage = journey.current?.subject ? journey.current : null

  return {
    req,
    siteInfo,
    messages,
    question,
    turnId: input.lastMessage.id,
    conversation: askIdFrom(body?.id),
    pagePath,
    isFollowUp: messages.length > 1,
    previousQuestion: previousUserQuestion(messages),
    handoffState,
    mode,
    journey,
    subjectPage,
    storyBrief:
      mode === 'on' && subjectPage ? resolveStoryBrief(req.payload, subjectPage.path) : null,
    hasContactDetails:
      offersAskHandoff(handoffState) &&
      (findEmailAddress(question) !== null || hasIdentifyingNumber(question)),
    startedAt,
    judged: {
      turn: null,
      judgment: null,
      route: null,
      passages: [],
      chunksKept: null,
      firstOutputMs: null,
      modelSkipped: false,
      pageAttached: false,
      thinStory: false,
    },
    sources: [],
    retrieval: 'none',
    chunkCandidates: 0,
    recorded: false,
  }
}

function markFirstOutput(turn: AskTurn): void {
  turn.judged.firstOutputMs ??= Date.now() - turn.startedAt
}

/**
 * Records the turn once, whichever callback closes it (a model stream can
 * end in a finish, an error, or the visitor's Stop): its row now, its log
 * line and event once the judge has settled.
 */
function recordTurn(turn: AskTurn, closed: AskTurnClose): void {
  if (turn.recorded) return
  turn.recorded = true
  const latencyMs = Date.now() - turn.startedAt
  recordAskQuestion(turn.req, {
    question: turn.question,
    turn: turn.turnId,
    conversation: turn.conversation,
    pagePath: turn.pagePath,
    followUp: turn.isFollowUp,
    retrieval: turn.retrieval,
    sources: turn.sources,
    latencyMs,
    ...closed,
  })

  const report = () => reportTurn(turn, closed, latencyMs)
  // Only shadow mode can still be waiting on Jev here; it must not hold the reply.
  if (turn.mode === 'shadow') afterResponse(report)
  else void report()
}

/** The judge's part in a closed turn, with every answer it was still waiting on. */
type SettledJudge = {
  judgment: AskTurnJudgment | null
  /** The turn's passage checks pooled into one. */
  passages: AskPassageJudgment | null
  route: AskTurnRoute | null
  chunksKept: number
}

async function settleJudge(turn: AskTurn): Promise<SettledJudge> {
  const { judged } = turn
  // Shadow mode never waits on Jev in the response path, so its answers
  // are collected here; each is bounded by the judge's own timeout.
  const judgment = judged.turn ? await judged.turn : judged.judgment
  const checks = (await Promise.all(judged.passages)).filter((check) => check !== null)
  const passages =
    checks.length > 0
      ? {
          answers: checks.flatMap((check) => check.answers),
          // The checks ran side by side: the wait was the slower one's.
          ms: Math.max(...checks.map((check) => check.ms)),
        }
      : null
  // Shadow's route is what `on` would have decided for this turn.
  const route =
    judged.route ??
    (turn.mode === 'shadow'
      ? routeTurn(judgment, { isFollowUp: turn.isFollowUp, handoffState: turn.handoffState })
      : null)
  const chunksKept =
    judged.chunksKept ??
    (passages
      ? passages.answers.filter((answers) => routePassage(answers) === 'keep').length
      : turn.chunkCandidates)
  return { judgment, passages, route, chunksKept }
}

/**
 * Shadow mode's agreement: whether the card `on` would have shown is the card
 * the turn closed with. Null outside shadow, for a reply that was stopped or
 * failed, and where `on` would have taken today's path.
 */
function judgeAgrees(
  turn: AskTurn,
  { route, passages, chunksKept }: SettledJudge,
  closed: AskTurnClose,
): boolean | null {
  const settled = closed.outcome !== 'stopped' && closed.outcome !== 'error'
  if (turn.mode !== 'shadow' || !settled || !route || route.kind === 'fallback') return null
  const card = turn.hasContactDetails
    ? 'contact_details'
    : shadowCard(route, passages ? chunksKept > 0 : turn.sources.length > 0)
  return card === closed.handoffReason
}

/** The judge's and the turn's metadata, shared by the log line and the PostHog event. */
function turnFacts(turn: AskTurn, judge: SettledJudge, closed: AskTurnClose) {
  const { mode, judged, journey } = turn
  const { judgment, passages, route } = judge
  return {
    judge_mode: mode,
    judge_ms: judgment?.ms ?? null,
    judge_failed: mode !== 'off' && judged.turn !== null && judgment === null,
    judge_request: judgment?.request ?? null,
    judge_confidence: judgment?.confidence ?? null,
    judge_agrees: judgeAgrees(turn, judge, closed),
    chunks_candidates: turn.chunkCandidates,
    chunks_kept: judge.chunksKept,
    passages_ms: passages?.ms ?? null,
    first_output_ms: judged.firstOutputMs,
    model_skipped: judged.modelSkipped,
    fell_back: mode === 'on' && route?.kind === 'fallback',
    journey_pages: journey.read.length + (journey.current ? 1 : 0),
    page_leaned: turn.subjectPage ? leansOnPage(judgment) : null,
    page_attached: judged.pageAttached,
    story_thin: judged.thinStory,
    answer_model: judged.modelSkipped ? null : askModel.modelId,
  }
}

async function reportTurn(turn: AskTurn, closed: AskTurnClose, latencyMs: number): Promise<void> {
  const judge = await settleJudge(turn)
  const facts = turnFacts(turn, judge, closed)
  const { req, question, sources, isFollowUp, retrieval, pagePath } = turn
  req.payload.logger.info({
    msg: 'ask answered',
    questionLength: question.length,
    sourceCount: sources.length,
    outcome: closed.outcome,
    handoffReason: closed.handoffReason,
    latencyMs,
    ...facts,
    judge_model: judge.judgment?.model ?? null,
  })
  captureServerEvent({
    headers: req.headers,
    fallbackDistinctId: `ask:${crypto.randomUUID()}`,
    event: 'ask_questioned',
    properties: {
      is_follow_up: isFollowUp,
      source_count: sources.length,
      question_length: question.length,
      handoff_reason: closed.handoffReason,
      outcome: closed.outcome,
      retrieval,
      latency_ms: latencyMs,
      page_path: pagePath,
      ...facts,
    },
  })
}

/** The card as the whole reply: no retrieval behind it, no model call. */
function cardOnly(turn: AskTurn, reason: AskHandoffReason): Response {
  turn.judged.modelSkipped = true
  markFirstOutput(turn)
  recordTurn(turn, {
    answer: '',
    outcome: askOutcome({ grounded: false, handoffReason: reason }),
    handoffReason: reason,
  })
  return handoffResponse(resolveAskHandoff(turn.siteInfo, reason))
}

/** The turn's query forms, embedding already, and which of them a search may pick. */
type AskRetrievalPlan = {
  prepared: PreparedRetrieval
  defaultQuery: number
  /** The question under its page's title; only `on` prepares it. */
  pageQuery: number | null
}

/**
 * The query is embedded while Jev reads the turn: the embedding call is
 * the slower of the two, so the turn's decision adds no wait. Only `on`
 * embeds both query forms, to pick once `depends_on_previous` is known.
 * A third form waits beside them when the question was asked on a page
 * about one thing: the question under that page's title, searched only
 * if `open_reference` says the question leaves its subject to the page.
 */
function startRetrieval(turn: AskTurn): AskRetrievalPlan {
  const queries = retrievalQueries(turn.question, turn.previousQuestion)
  const defaultQuery = queries.length - 1
  let pageQuery: number | null = null
  if (turn.mode === 'on' && turn.subjectPage) {
    pageQuery = queries.length
    queries.push(pageRetrievalQuery(turn.question, turn.subjectPage.title))
  }
  const prepared = prepareRetrieval(
    turn.req.payload,
    turn.mode === 'on' ? queries : queries.slice(-1),
  )
  return { prepared, defaultQuery, pageQuery }
}

/** Jev's read of the turn, asked beside the embedding; `off` asks nothing. */
function startJudge(turn: AskTurn): void {
  if (turn.mode === 'off') return
  turn.judged.turn = judgeTurn({
    question: turn.question,
    previousQuestion: turn.previousQuestion,
    onKnownPage: turn.subjectPage !== null,
    signal: turn.req.signal,
    logger: turn.req.payload.logger,
  })
}

/** `on` waits for Jev's read and routes the turn by it. */
async function judgedRoute(turn: AskTurn): Promise<AskTurnRoute> {
  turn.judged.judgment = await turn.judged.turn
  const route = routeTurn(turn.judged.judgment, {
    isFollowUp: turn.isFollowUp,
    handoffState: turn.handoffState,
  })
  turn.judged.route = route
  return route
}

/**
 * Jev's passage check. `on` hands it to the retrieval seam as a veto and
 * drops what it drops; `shadow` only watches the same candidates, and
 * reads the answer when the turn is recorded.
 */
function passageChecks(turn: AskTurn) {
  const checkPassages = (query: string, chunks: AskPassage[]) => {
    const passages = judgePassages({
      query,
      chunks,
      signal: turn.req.signal,
      logger: turn.req.payload.logger,
    })
    turn.judged.passages.push(passages)
    return passages
  }
  const check: PassageCheck = async (query, chunks) => {
    const passages = await checkPassages(query, chunks)
    return (
      passages?.answers.map((answers) => routePassage(answers) === 'keep') ?? chunks.map(() => true)
    )
  }
  return { checkPassages, check }
}

/**
 * A follow-up that leans on the previous turn searches with it, as
 * before, and any other routed turn searches alone. A turn that points
 * at something it does not name searches under its page's title as
 * well: beside, never instead, so a wrong yes loses nothing ("them" in
 * a follow-up may be the last answer's subject or the page's, and the
 * pool holds both).
 */
async function searchSources(
  turn: AskTurn,
  route: AskTurnRoute,
  plan: AskRetrievalPlan,
): Promise<void> {
  const { mode, judged } = turn
  const { checkPassages, check } = passageChecks(turn)
  let query = mode === 'on' ? plan.defaultQuery : undefined
  let also: number | undefined
  if (route.kind === 'evidence') {
    if (!(turn.isFollowUp && dependsOnPrevious(judged.judgment))) query = 0
    if (plan.pageQuery !== null && leansOnPage(judged.judgment)) {
      also = plan.pageQuery
      judged.pageAttached = true
    }
  }
  const found = await plan.prepared.search({
    query,
    also,
    check: route.kind === 'evidence' ? check : undefined,
    observe: mode === 'shadow' ? checkPassages : undefined,
  })
  turn.sources = found.sources
  turn.retrieval = found.path
  turn.chunkCandidates = found.chunks.candidates
  if (mode === 'on') judged.chunksKept = found.chunks.kept
}

/**
 * A question about the page's own case study, where that story is still
 * thin: the record's brief leads the sources, so the answer can always
 * name the kinds of work, and a passage check that kept nothing no longer
 * means "the site doesn't cover that". The page is the subject when the
 * question leaves its subject to it (Jev's `open_reference`) or names it
 * (code's lookup); a follow-up that leans on the turn before it is about
 * that turn's subject, which may be another client.
 */
function thinStoryOf(turn: AskTurn, brief: AskStoryBrief | null): AskStoryBrief | null {
  const { judgment } = turn.judged
  return brief?.thin &&
    (namesStory(turn.question, brief) ||
      (leansOnPage(judgment) && !(turn.isFollowUp && dependsOnPrevious(judgment))))
    ? brief
    : null
}

/**
 * Nothing to ground on. Today's path: the card on a first turn, no tokens
 * spent, while follow-ups still reach the model source-less so the
 * conversation can carry ("thanks", "can you say that more simply?").
 * A routed turn: the card on any turn, since Jev already told a thanks
 * from a question; it carries the turn's own reason when it has one.
 */
function ungroundedCard(turn: AskTurn, route: AskTurnRoute): AskHandoffReason | null {
  if (turn.sources.length > 0 || !offersAskHandoff(turn.handoffState)) return null
  if (route.kind === 'evidence') return route.reason ?? 'no_answer'
  if (route.kind === 'fallback' && !turn.isFollowUp) return 'no_answer'
  return null
}

function sourcesBlock(sources: RetrievedSource[]): string {
  return sources
    .map(
      (source, i) =>
        `<source index="${i + 1}" title="${attr(source.title)}" url="${attr(source.url)}">\n${source.text}\n</source>`,
    )
    .join('\n\n')
}

type AskTools = { handoff: ReturnType<typeof askHandoffTool> }

/** How the writing model is asked for this turn's reply. */
type AnswerSetup = {
  grounded: boolean
  routed: boolean
  /** The card code appends after the words, for a routed, grounded turn. */
  closingCard: AskHandoffReason | null
  system: string
  tools: AskTools | undefined
}

/**
 * The prompt and the tool list agree: once the visitor has sent, the
 * tool is withheld and the prompt stops asking for it. A routed turn
 * never has the tool: the decision is made, and code appends the card.
 */
function answerSetup(
  turn: AskTurn,
  route: AskTurnRoute,
  thinStory: AskStoryBrief | null,
): AnswerSetup {
  const { sources, handoffState } = turn
  const grounded = sources.length > 0
  const routed = route.kind !== 'fallback'
  const offersTool = !routed && offersAskHandoff(handoffState)
  const closingCard =
    routed && grounded
      ? closingCardReason(route, {
          thinStory: thinStory !== null,
          mayOffer: offersAskHandoff(handoffState),
        })
      : null
  const system = [
    askSystemPrompt({
      grounded,
      handoff: handoffState,
      tool: offersTool,
      cardFollows: closingCard !== null,
      journey: routed ? turn.journey : null,
      thinStory: thinStory?.title ?? null,
    }),
    grounded ? `<sources>\n${sourcesBlock(sources)}\n</sources>` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    grounded,
    routed,
    closingCard,
    system,
    tools: offersTool ? { handoff: askHandoffTool(turn.siteInfo) } : undefined,
  }
}

function answerTokenBudget({ grounded, routed }: AnswerSetup): number {
  if (!grounded) return MAX_CHAT_ONLY_TOKENS
  return routed ? MAX_WRITING_TOKENS : MAX_ANSWER_TOKENS
}

/** The writing model's call; the turn is recorded however it ends. */
function streamAnswer(turn: AskTurn, setup: AnswerSetup, messages: ModelMessage[]) {
  const { closingCard } = setup
  return streamText({
    model: askModel,
    system: setup.system,
    messages,
    tools: setup.tools,
    maxOutputTokens: answerTokenBudget(setup),
    // The visitor's Stop (and a dropped connection) aborts the model call,
    // so tokens stop with the reader and the turn is recorded as stopped.
    abortSignal: turn.req.signal,
    // Extractive answers over provided sources don't need deep reasoning;
    // the default (medium) burns hidden reasoning tokens on every question.
    // `store: false`: OpenAI's Responses API otherwise keeps every exchange
    // for 30 days in the dashboard logs. Nothing here needs that: the client
    // resends the transcript each turn, and for reasoning models the SDK asks
    // for encrypted reasoning instead of server-side item references.
    providerOptions: {
      openai: {
        reasoningEffort: setup.routed ? REASONING_EFFORT.writing : REASONING_EFFORT.deciding,
        store: false,
      },
    },
    onChunk: ({ chunk }) => {
      if (chunk.type === 'text-delta' || chunk.type === 'tool-result') markFirstOutput(turn)
    },
    onFinish: ({ text, totalUsage, staticToolCalls }) => {
      const handoffReason =
        closingCard ??
        staticToolCalls.find((call) => call.toolName === 'handoff')?.input.reason ??
        null
      recordTurn(turn, {
        answer: text,
        outcome: askOutcome({ grounded: setup.grounded, handoffReason }),
        handoffReason,
        inputTokens: totalUsage.inputTokens ?? null,
        outputTokens: totalUsage.outputTokens ?? null,
      })
    },
    onAbort: ({ steps }) => {
      recordTurn(turn, {
        answer: steps.map((step) => step.text).join(''),
        outcome: 'stopped',
        handoffReason: null,
      })
    },
    // Logged once, by the reply stream's onError (replyResponse), which every error reaches.
    onError: () => recordTurn(turn, { answer: '', outcome: 'error', handoffReason: null }),
  })
}

type AskAnswerStream = ReturnType<typeof streamAnswer>

/**
 * The card after the words: the model's stream is forwarded without
 * its finish, then code writes the same part the tool call would
 * have, so a partial answer reliably ends in its offer. A reply that
 * was stopped or failed gets no card.
 */
async function writeAnswerThenCard(
  writer: UIMessageStreamWriter<AskUIMessage>,
  result: AskAnswerStream,
  handoff: () => AskHandoff,
): Promise<void> {
  const reader = toUIMessageStream<AskTools, AskUIMessage>({
    stream: result.fullStream,
    sendStart: false,
    sendFinish: false,
    sendReasoning: false,
  }).getReader()
  let settled = true
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value.type === 'abort' || value.type === 'error') settled = false
    writer.write(value)
  }
  if (settled) writeHandoff(writer, handoff())
  writer.write({ type: 'finish' })
}

/** The reply: the sources as source-url parts, then the model's words and any closing card. */
function replyResponse(
  turn: AskTurn,
  result: AskAnswerStream,
  closingCard: AskHandoffReason | null,
): Response {
  const stream = createUIMessageStream<AskUIMessage>({
    execute: async ({ writer }) => {
      writer.write({ type: 'start' })
      for (const source of turn.sources) {
        writer.write({
          type: 'source-url',
          sourceId: source.url,
          url: source.url,
          title: source.title,
        })
      }
      // The Ask UI renders text, sources, and the handoff card. Reasoning
      // parts would carry the encrypted reasoning blob to the browser and
      // back on every turn.
      if (!closingCard) {
        writer.merge(
          toUIMessageStream<AskTools, AskUIMessage>({
            stream: result.fullStream,
            sendStart: false,
            sendReasoning: false,
          }),
        )
        return
      }
      await writeAnswerThenCard(writer, result, () => resolveAskHandoff(turn.siteInfo, closingCard))
    },
    onError: (err) => {
      turn.req.payload.logger.error({ msg: 'ask reply failed', err })
      return 'Something went wrong answering that. Try again shortly.'
    },
  })

  return createUIMessageStreamResponse({ stream })
}

const ask: Endpoint = {
  path: '/ask',
  method: 'post',
  handler: async (req) => {
    // Site Info › Ask › Hide Ask removes every surface, this one included:
    // a hidden feature must not keep answering (and billing) for stale
    // clients or direct callers.
    const siteInfo = await req.payload.findGlobal({ slug: 'site-info', depth: 0 })
    const refusal = refuseAsk(req, siteInfo)
    if (refusal) return refusal

    const input = await readAskInput(req)
    if (input instanceof Response) return input

    const turn = await openTurn(req, siteInfo, input)

    // Contact details are a known rule, so code finds them (the same patterns
    // that redact them) before Jev or the model is asked anything.
    if (turn.mode === 'on' && turn.hasContactDetails) return cardOnly(turn, 'contact_details')

    const plan = startRetrieval(turn)
    startJudge(turn)
    const route: AskTurnRoute = turn.mode === 'on' ? await judgedRoute(turn) : { kind: 'fallback' }
    if (route.kind === 'card') return cardOnly(turn, route.reason)

    if (route.kind !== 'conversation') await searchSources(turn, route, plan)

    const thinStory = route.kind === 'evidence' ? thinStoryOf(turn, await turn.storyBrief) : null
    if (thinStory) {
      turn.sources = withStoryBrief(turn.sources, thinStory)
      turn.judged.thinStory = true
    }

    const ungrounded = ungroundedCard(turn, route)
    if (ungrounded) return cardOnly(turn, ungrounded)

    const setup = answerSetup(turn, route, thinStory)
    const result = streamAnswer(turn, setup, await convertToModelMessages(turn.messages))
    return replyResponse(turn, result, setup.closingCard)
  },
}

/**
 * Public: the visitor's word on a turn. A thumbs up or down (with a one-tap
 * reason), or the contact-page click; `inquiry_sent` is the intake's to
 * write, never a caller's. The row is found by the chat and message ids the
 * client already holds, so no row id ever reaches the browser; an unknown
 * pair is a quiet no-op. Its own limiter budget, so taps never cost questions.
 */
const feedback: Endpoint = {
  path: '/ask/feedback',
  method: 'post',
  handler: async (req) => {
    if (isRateLimited(req, 'feedback')) return json({ error: RATE_LIMITED }, 429)

    const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null
    const rating = isOption(ASK_RATINGS, body?.rating) ? body.rating : undefined
    const ratingReason =
      rating === 'down' && isOption(ASK_RATING_REASONS, body?.reason) ? body.reason : undefined
    const handoff = body?.handoff === 'clicked' ? 'clicked' : undefined
    if (!rating && !handoff) return json({ error: 'Nothing to record.' }, 400)

    const turn = await markAskTurn(
      req.payload,
      { conversation: body?.id, turn: body?.turn },
      { rating, ratingReason, handoff },
    )
    if (turn) captureAskFeedback(req, { rating, ratingReason, handoff, ...turn })
    return json({ ok: true })
  },
}

/** `ask_rated` for a rating, `ask_handoff_clicked` for the contact-page fallback; an inquiry is its own event. */
function captureAskFeedback(
  req: PayloadRequest,
  signal: {
    rating?: string
    ratingReason?: string
    handoff?: string
    outcome: AskOutcome | null
    sourceCount: number
  },
): void {
  const event = signal.rating
    ? 'ask_rated'
    : signal.handoff === 'clicked'
      ? 'ask_handoff_clicked'
      : null
  if (!event) return
  captureServerEvent({
    headers: req.headers,
    fallbackDistinctId: `ask:${crypto.randomUUID()}`,
    event,
    properties: {
      rating: signal.rating ?? null,
      reason: signal.ratingReason ?? null,
      outcome: signal.outcome,
      source_count: signal.sourceCount,
    },
  })
}

/**
 * Team-only: rebuilds the embedding index from every published document and
 * global, the same pass as `scripts/backfill-ask-index.ts`. Wired to the
 * "Rebuild index" panel in Site Info › Ask. Runs inline (the jobs cron fires
 * once a day, too slow for a button); unchanged chunks reuse their vectors so
 * a rebuild over a corpus that has not changed costs no embedding tokens.
 */
const reindex: Endpoint = {
  path: '/ask/reindex',
  method: 'post',
  handler: async (req) => {
    // `req.user` is also set for MCP API keys; only team members may rebuild.
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      return json(
        { error: `${ASK_MODEL_API_KEY_VAR} is not set, so nothing can be embedded.` },
        503,
      )
    }
    if (isBackfillRunning()) {
      return json({ error: 'A rebuild is already running. Try again in a minute.' }, 409)
    }

    const summary = await backfillAskIndex(req.payload)
    req.payload.logger.info({ msg: 'ask index rebuilt from admin', user: req.user.id, ...summary })
    return json(summary)
  },
}

/**
 * Team-only: when the Ask index was last rebuilt, for the "Rebuild index"
 * panel. Reads the summary the last pass stored; nothing is recomputed.
 */
const indexStatus: Endpoint = {
  path: '/ask/reindex',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ lastRebuild: await readLastIndexRebuild(req.payload) })
  },
}

/**
 * Team-only: the last OpenAI usage report someone refreshed, for the "Usage"
 * panel in Site Info › Ask. Served from KV, so opening the panel never calls
 * OpenAI; `report` is null until the first refresh.
 */
const usage: Endpoint = {
  path: '/ask/usage',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ configured: isUsageConfigured(), report: await readUsageReport(req.payload) })
  },
}

/**
 * Team-only: fetch a fresh usage report from OpenAI and store it. Only the
 * panel's Refresh button calls this; the Admin API allows 30 requests a
 * minute and each refresh spends three of them.
 */
const usageRefresh: Endpoint = {
  path: '/ask/usage',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!isUsageConfigured()) {
      return json({ error: `${OPENAI_ADMIN_KEY_VAR} is not set.`, configured: false }, 503)
    }

    try {
      return json({ configured: true, report: await refreshUsageReport(req.payload) })
    } catch (err) {
      if (err instanceof OpenAIAdminError) {
        req.payload.logger.error({ msg: 'ask usage fetch failed', err })
        const hint =
          err.status === 401
            ? `OpenAI rejected the key. ${OPENAI_ADMIN_KEY_VAR} must be an Admin key (Settings › Organization › Admin keys), not a project key.`
            : err.message
        return json({ error: hint }, 502)
      }
      throw err
    }
  },
}

export const askEndpoints: Endpoint[] = [ask, feedback, reindex, indexStatus, usage, usageRefresh]

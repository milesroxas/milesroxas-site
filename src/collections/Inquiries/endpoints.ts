import type { Endpoint, PayloadRequest } from 'payload'
import { askIdFrom, markAskTurnAfterResponse } from '@/features/ask/questions'
import type { Inquiry } from '@/payload-types'
import {
  INQUIRY_BUDGETS,
  INQUIRY_EMAIL_INVALID,
  INQUIRY_MESSAGE_MAX_LENGTH,
  INQUIRY_TIMELINES,
  INQUIRY_TYPES,
  type InquiryType,
} from '@/shared/content/inquiry'
import { isOption, type SelectOption } from '@/shared/content/options'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { captureServerEvent } from '@/utilities/posthog-server'
import { deliverInquiryEmails } from './notify'

/**
 * Public inquiry intake (POST /api/inquiries/submit).
 *
 * Notes for the security-minded reader:
 * - The collection itself is team-only. This is the one door in, and it writes
 *   through the Local API server-side, so the shape of what gets stored is
 *   decided here rather than by whatever the browser posted.
 * - Every enum value is checked against the canonical list, so a crafted
 *   payload cannot widen the stored vocabulary.
 * - A honeypot field silently swallows naive bots, and a short per-email
 *   window absorbs double submits (an impatient second click must not create a
 *   second lead) without telling a prober anything.
 * - sas-site adds Vercel BotID here; this site does not run it (composer
 *   roadmap, Phase 5), so the honeypot and the dedupe window are the guard.
 * - Free text is length-capped before it reaches the database, not after.
 */
const MAX_NAME_LENGTH = 200
const MAX_COMPANY_LENGTH = 200
const MAX_URL_LENGTH = 500

/** Repeat submissions from one address inside this window collapse into the first. */
const DEDUPE_WINDOW_MS = 60_000

const json = (body: unknown, status = 200) => Response.json(body, { status })

const trimmed = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const next = value.trim().slice(0, max)
  return next.length > 0 ? next : undefined
}

const oneOf = <T extends string>(options: readonly SelectOption<T>[], value: unknown) =>
  isOption(options, value) ? value : undefined

/** Was this address here a moment ago? Then this is the same request twice. */
async function recentDuplicate(req: PayloadRequest, email: string): Promise<Inquiry | undefined> {
  const { docs } = await req.payload.find({
    collection: 'inquiries',
    where: {
      email: { equals: email },
      submittedAt: { greater_than: new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString() },
    },
    limit: 1,
    depth: 0,
    sort: '-submittedAt',
    req,
  })
  return docs[0]
}

type SubmissionBody = Record<string, unknown>

type RequiredAnswers = { email: string; name: string; message: string }

/** The answers no inquiry can do without, or what to tell the visitor about the first one missing. */
function requiredAnswers(body: SubmissionBody): RequiredAnswers | { error: string } {
  const email = typeof body.email === 'string' ? normalizeEmailAddress(body.email) : ''
  if (!isValidEmailAddress(email)) return { error: INQUIRY_EMAIL_INVALID }

  const name = trimmed(body.name, MAX_NAME_LENGTH)
  if (!name) return { error: 'Enter your name.' }

  const message = trimmed(body.message, INQUIRY_MESSAGE_MAX_LENGTH)
  if (!message) return { error: 'Add a message for Miles.' }

  return { email, name, message }
}

/** The row to store: free text capped, every enum checked against the canonical list. */
const inquiryData = (
  body: SubmissionBody,
  { email, name, message }: RequiredAnswers,
  type: InquiryType,
  askConversation: string | undefined,
) => ({
  type,
  status: 'new' as const,
  name,
  email,
  message,
  company: trimmed(body.company, MAX_COMPANY_LENGTH),
  website: trimmed(body.website, MAX_URL_LENGTH),
  sourceUrl: trimmed(body.sourceUrl, MAX_URL_LENGTH),
  // The Ask chat it came from, kept only when the id has the SDK's shape.
  askConversation,
  ...(type === 'project'
    ? {
        budget: oneOf(INQUIRY_BUDGETS, body.budget),
        timeline: oneOf(INQUIRY_TIMELINES, body.timeline),
      }
    : {}),
})

/**
 * Everything a stored inquiry sets off. Runs after `create` resolves, and not
 * a moment before: Payload runs afterChange and afterOperation *inside* the
 * transaction and commits afterwards, so a hook that emails would promise the
 * sender a receipt for a row that could still roll back. The emails are
 * awaited rather than left floating, because a serverless invocation ends with
 * the response.
 */
async function announceInquiry(
  req: PayloadRequest,
  created: Inquiry,
  type: InquiryType,
  ask: { conversation: string | undefined; turn: unknown },
) {
  await deliverInquiryEmails(req, created)

  // The Ask turn this inquiry closes learns it was sent.
  if (ask.conversation) {
    markAskTurnAfterResponse(
      req,
      { conversation: ask.conversation, turn: ask.turn },
      { handoff: 'inquiry_sent' },
    )
  }

  // Deferred past the response, so the lead never waits on analytics.
  captureServerEvent({
    headers: req.headers,
    fallbackDistinctId: `inquiry:${created.id}`,
    event: 'inquiry_submitted',
    properties: {
      inquiry_type: type,
      // Came out of an Ask chat (the handoff card or the contact-page fallback): which leads Ask produced.
      from_ask: Boolean(ask.conversation),
    },
  })
}

const submit: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    try {
      // An unreadable body reads as an empty one: every answer is then missing.
      const body = ((await req.json?.().catch(() => null)) ?? {}) as SubmissionBody

      // Honeypot: the field is off-screen, so only a bot ever fills it in.
      if (typeof body.role === 'string' && body.role.length > 0) {
        return json({ reference: null, submittedAt: new Date().toISOString() })
      }

      const answers = requiredAnswers(body)
      if ('error' in answers) {
        return json({ error: answers.error }, 400)
      }

      const type: InquiryType = oneOf(INQUIRY_TYPES, body.type) ?? 'general'
      const askConversation = askIdFrom(body.askConversation) ?? undefined

      const duplicate = await recentDuplicate(req, answers.email)
      if (duplicate) {
        return json({ reference: duplicate.reference, submittedAt: duplicate.submittedAt })
      }

      const created = await req.payload.create({
        collection: 'inquiries',
        req,
        // Deliberate, and the reason this endpoint exists: the collection is
        // team-only, so the write has to run as the system. Every value above
        // has already been checked against the canonical vocabulary, which is
        // what makes bypassing access control safe here. No `user` is passed —
        // if one ever is, this must become `overrideAccess: false`.
        overrideAccess: true,
        data: inquiryData(body, answers, type, askConversation),
      })

      await announceInquiry(req, created, type, {
        conversation: askConversation,
        turn: body.askTurn,
      })

      return json({ reference: created.reference, submittedAt: created.submittedAt })
    } catch (err) {
      req.payload.logger.error({ msg: 'Inquiry submission failed', err })
      return json({ error: 'Something went wrong sending that. Try again in a moment.' }, 500)
    }
  },
}

export const inquiryEndpoints: Endpoint[] = [submit]

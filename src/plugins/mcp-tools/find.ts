import { noul, type Questions, score } from '@typesafe-ai/sdk'
import type { CollectionSlug, GlobalSlug } from 'payload'
import type { NearestChunk } from '@/features/ask/embeddings'
import { extractTerms } from '@/features/ask/retrieve'
import { globalSurfaceBySlug, indexedSourcePath } from '@/shared/content/surfaces'
import type { Jev } from './jev'

/**
 * The judgment behind `findContent`: where the published site talks about a
 * topic. Pure over retrieved chunks, so the tests can run it without a
 * database or an embedding call.
 *
 * Two stages, the shape of TypeSafe's RAG-passage and re-ranking cookbooks.
 * Code retrieves: the Ask index (`ask_embeddings`, published copy of every
 * public surface, protected works never in it) gives the chunks nearest the
 * topic, with a low similarity floor because the next stage is the real
 * filter. Jev judges: one request per chunk, all in parallel, because a state
 * full of unrelated passages costs jev-1.13 accuracy. Each request asks two
 * independent questions over the same state: a Noul, whether the passage
 * touches the topic at all, and a Score, how much of it is about the topic.
 * The Noul keeps or drops; the Score orders what is kept. Vector similarity
 * never decides: two passages about neighbouring subjects read alike to an
 * embedding and differently to a reader.
 *
 * Code owns the policy: the thresholds are here and nowhere else.
 */

/** Where findContent looks: every row source of the Ask index. `find.test.ts` keeps it in step with `surfaces.ts`. */
export const FIND_SOURCES = ['pages', 'works', 'posts', 'site-info'] as const satisfies readonly (
  | CollectionSlug
  | GlobalSlug
)[]

export type FindSource = (typeof FIND_SOURCES)[number]

/** Chunks retrieved before judging. Each is one Jev request of about 600 tokens. */
export const FIND_CANDIDATES = 24

/**
 * The similarity floor for a candidate. Ask's checked floor
 * (`CHECKED_MIN_SIMILARITY` in `features/ask/retrieve.ts`): with a judge
 * behind it, the floor is only a cheap first cut.
 */
export const FIND_MIN_SIMILARITY = 0.2

export const FIND_LIMIT = 10
export const FIND_MAX_LIMIT = 20

/** Starting values, to be read against real searches on this site. */
export const FIND_THRESHOLDS = {
  /** `mentions` at or above which a passage is kept. */
  mentions: 0.5,
} as const

const SNIPPET_CHARS = 240

const FOCUS = ['passing', 'part', 'subject'] as const

export type FindFocus = (typeof FOCUS)[number]

/** Ask Jev about one passage. The topic is in the state, so the questions are fixed text. */
const FIND_QUESTIONS = {
  mentions: noul('Does `passage` mention or discuss `topic`?', {
    true: 'The passage names the topic, or talks about it in other words: a synonym, a product, client or place name that stands for it, or a description of it.',
    false:
      'The topic is not in the passage in any words. A passage about a neighbouring subject that never touches the topic does not count.',
  }),
  focus: score('How much of `passage` is about `topic`?', [
    'Little or none: the topic is named once, in passing or in a list, and the passage is about something else.',
    'Part: a sentence or two of the passage are about the topic, and the rest is about something else.',
    'All of it: the passage as a whole is about the topic.',
  ]),
} satisfies Questions

export type FindRow = {
  /** The collection or global the passage is from. */
  collection: string
  /** The document id for outlineDocument or locateBlock; null for a global. */
  id: number | null
  title: string
  /** Where the passage is published on the site. */
  url: string | null
  /** The section heading trail the passage sits under. */
  heading: string | null
  snippet: string
  similarity: number
  /** Probability the passage mentions the topic; null when the check failed or was not run. */
  mentions: number | null
  /** How much of the passage is about the topic; null when the check failed or was not run. */
  focus: FindFocus | null
}

export type FindResult = {
  /** False when the server has no TypeSafe key: rows are in similarity order, unchecked. */
  judged: boolean
  rows: FindRow[]
  /** Candidates the Noul dropped. */
  dropped: number
  /** Candidates whose check failed. They are listed last, with `mentions: null`. */
  failed: number
  model: string | null
  requests: number
  inputTokens: number
  ms: number
}

/** A window of the chunk around the first word of the topic it contains, else its start. */
export function snippetFor(text: string, topic: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const lower = flat.toLowerCase()
  const hits = extractTerms(topic)
    .map((term) => lower.indexOf(term))
    .filter((index) => index >= 0)
  const hit = hits.length ? Math.min(...hits) : 0
  const start = Math.max(0, Math.min(hit - SNIPPET_CHARS / 3, flat.length - SNIPPET_CHARS))
  const end = Math.min(flat.length, start + SNIPPET_CHARS)
  return `${start > 0 ? '…' : ''}${flat.slice(start, end).trim()}${end < flat.length ? '…' : ''}`
}

const baseRow = (chunk: NearestChunk, topic: string): FindRow => ({
  collection: chunk.collection,
  id: globalSurfaceBySlug.has(chunk.collection) ? null : chunk.docId,
  title: chunk.title,
  url: indexedSourcePath(chunk.collection, chunk.slug),
  heading: chunk.headingPath,
  snippet: snippetFor(chunk.text, topic),
  similarity: Math.round(chunk.similarity * 1000) / 1000,
  mentions: null,
  focus: null,
})

/** The expected Score, 0 to 2, rounded to the level a person would name. */
const focusOf = (expected: number): FindFocus =>
  FOCUS[Math.min(FOCUS.length - 1, Math.max(0, Math.round(expected)))] ?? 'passing'

/** Rows in similarity order with no judgment: the server has no TypeSafe key. */
export function unjudged(chunks: NearestChunk[], topic: string): FindResult {
  return {
    judged: false,
    rows: chunks.map((chunk) => baseRow(chunk, topic)),
    dropped: 0,
    failed: 0,
    model: null,
    requests: 0,
    inputTokens: 0,
    ms: 0,
  }
}

/** Judges every chunk against the topic and keeps the ones that mention it, most about it first. */
export async function judgeChunks(
  jev: Jev,
  chunks: NearestChunk[],
  topic: string,
): Promise<FindResult> {
  const startedAt = performance.now()
  const judged = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const result = await jev.systemOne({
          state: {
            topic,
            passage: { page: chunk.title, section: chunk.headingPath, text: chunk.text },
          },
          questions: FIND_QUESTIONS,
        })
        return {
          chunk,
          mentions: result.answers.mentions.noul,
          focus: result.answers.focus.score,
          model: result.model,
          inputTokens: result.usage.input_tokens,
        }
      } catch {
        return { chunk, mentions: null, focus: null, model: null, inputTokens: 0 }
      }
    }),
  )

  const answered = judged.filter((row) => row.mentions !== null)
  // By the named level, then the Noul: jev-1.13's Score expectation is weakly
  // calibrated between levels, so it only buckets and never ranks.
  const level = (focus: number | null) => Math.round(focus ?? 0)
  const kept = answered
    .filter((row) => (row.mentions ?? 0) >= FIND_THRESHOLDS.mentions)
    .sort((a, b) => level(b.focus) - level(a.focus) || (b.mentions ?? 0) - (a.mentions ?? 0))
  const failed = judged.filter((row) => row.mentions === null)

  return {
    judged: true,
    rows: [
      ...kept.map((row) => ({
        ...baseRow(row.chunk, topic),
        mentions: Math.round((row.mentions ?? 0) * 1000) / 1000,
        focus: focusOf(row.focus ?? 0),
      })),
      ...failed.map((row) => baseRow(row.chunk, topic)),
    ],
    dropped: answered.length - kept.length,
    failed: failed.length,
    model: answered[0]?.model ?? null,
    requests: chunks.length,
    inputTokens: judged.reduce((sum, row) => sum + row.inputTokens, 0),
    ms: Math.round(performance.now() - startedAt),
  }
}

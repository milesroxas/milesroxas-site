import type { Video } from '@/payload-types'

/**
 * What a Video document is for, with no server imports so the player and the
 * admin panel can read it too: a full-length video that plays on click, with
 * a short loop that runs muted until then (docs/media.md, "Videos").
 *
 * The loop is a few seconds Stream cuts out of the source as a video of its
 * own, so the visitor downloads those seconds and nothing more. Eight seconds
 * by default: long enough not to feel like a stutter, short enough to read as
 * a preview rather than the video itself, and about one segment group on
 * Stream's ladder. A source no longer than the loop loops whole, uncut.
 */
export const LOOP = { start: 0, length: 8, min: 3, max: 30 } as const

/** A Video document as the hooks, the endpoint and the Local API hand it over. */
export type VideoDoc = Partial<Video> & { id: Video['id'] }

export type LoopRange = { start: number; end: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const numberOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

/**
 * Where the loop is cut from, in seconds of the source: the editor's start
 * and length, or the defaults, clamped to the video. `null` while the
 * duration is unknown, and for a source the loop would cover anyway, which
 * loops whole. A start past the end moves back so the loop keeps its length.
 */
export function loopRange(doc: VideoDoc): LoopRange | null {
  const duration = numberOr(doc.duration, 0)
  if (duration <= 0) return null
  const length = clamp(numberOr(doc.loop?.length, LOOP.length), LOOP.min, LOOP.max)
  if (duration <= length) return null
  const start = clamp(numberOr(doc.loop?.start, LOOP.start), 0, duration - length)
  return { start, end: start + length }
}

export const sameLoopRange = (a: LoopRange | null, b: LoopRange | null): boolean =>
  a?.start === b?.start && a?.end === b?.end

/**
 * How far along the pipeline a video is. `failed` carries Stream's reason or
 * the request that broke, and stays until a later pass gets further.
 */
export const VIDEO_STAGES = {
  pending: 'Waiting for Stream',
  encoding: 'Encoding',
  cutting: 'Cutting the loop',
  encodingLoop: 'Encoding the loop',
  ready: 'Ready',
  failed: 'Failed',
} as const

export type VideoStage = keyof typeof VIDEO_STAGES

export function stageOf(doc: VideoDoc): VideoStage {
  if (doc.streamError) return 'failed'
  if (!doc.cloudflareStreamUid) return 'pending'
  if (!doc.cloudflareStreamReady) return 'encoding'
  if (doc.loopReady) return 'ready'
  return doc.loopUid ? 'encodingLoop' : 'cutting'
}

/** The stage is final: nothing left to ask Stream until the editor saves again. */
export const isSettled = (stage: VideoStage): boolean => stage === 'ready' || stage === 'failed'

/** `m:ss` from seconds, for the duration badge and the admin panel. */
export function formatSeconds(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

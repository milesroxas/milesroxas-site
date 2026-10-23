import type { Endpoint } from 'payload'
import {
  formatSeconds,
  type LoopRange,
  loopRange,
  stageOf,
  VIDEO_STAGES,
  type VideoDoc,
  type VideoStage,
} from './stage'
import { advanceAndStore } from './stream'

/** What `GET /api/videos/:id/status` answers, and the admin panel renders. */
export type VideoStatus = {
  stage: VideoStage
  label: string
  /** Seconds, once Stream has inspected the file. */
  duration: number | null
  /** `m:ss` of the duration, for the panel. */
  durationLabel: string | null
  /** Where the loop is cut from, or `null` while unknown or when the source loops whole. */
  loop: LoopRange | null
  /** Why the last pass failed, in the `failed` stage. */
  error: string | null
}

function videoStatus(doc: VideoDoc): VideoStatus {
  const stage = stageOf(doc)
  const duration = typeof doc.duration === 'number' ? doc.duration : null
  return {
    stage,
    label: VIDEO_STAGES[stage],
    duration,
    durationLabel: duration === null ? null : formatSeconds(duration),
    loop: loopRange(doc),
    error: stage === 'failed' ? (doc.streamError ?? null) : null,
  }
}

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * The admin's status poll, and the pump that moves a video along while the
 * editor watches: each call asks Stream about whatever is pending, stores
 * what it learned and answers the stage. Team members only; an MCP key is
 * `req.user` too and gets nothing here.
 */
export const videoStatusEndpoint: Endpoint = {
  path: '/:id/status',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return json({ error: 'Not found' }, 404)
    const doc = await req.payload.findByID({
      collection: 'videos',
      id,
      depth: 0,
      disableErrors: true,
    })
    if (!doc) return json({ error: 'Not found' }, 404)
    return json(videoStatus(await advanceAndStore(req.payload, doc)))
  },
}

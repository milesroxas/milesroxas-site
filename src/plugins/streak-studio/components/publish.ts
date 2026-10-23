import type { useForm } from '@payloadcms/ui'
import { SURFACES } from '@/features/immersive/studio/effect'
import { type EffectId, effectOf } from '@/features/immersive/studio/effects'
import type { LookGround } from '@/features/immersive/studio/ground'
import {
  POSTER_CAPTURE,
  type Recipe,
  STILL_UPLOAD_BUDGET,
  snapshotRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { type Still, stillLabel, validateStills } from '@/features/immersive/studio/stills'
import type { Media, StreakLook } from '@/payload-types'
import type { PublishedState } from './look-store'
import { LOOKS_SLUG } from './paths'
import { stillShot } from './shot'
import { draftState } from './status'
import { sessionKey, studioStore } from './store'

type Submit = ReturnType<typeof useForm>['submit']

/** The saved look a still is rendered from, and the ground a filled still is laid over. */
type StillSource = {
  id: number | string
  effect: EffectId
  recipe: Recipe
  ground: LookGround
  stills: Still[]
}

type CaptureCall = Parameters<typeof import('@/features/immersive').captureStills>[0]

let chain: Promise<unknown> = Promise.resolve()

/**
 * Captures run one after another, one extra WebGL context at a time: the
 * still preview, the contact sheet and a publish all render through here, so
 * none of them contends with another for the GPU. A call aborted while it
 * waits never renders.
 */
export function captureSerial(input: CaptureCall): Promise<Blob[]> {
  const run = chain.then(async () => {
    if (input.signal?.aborted) throw new DOMException('The capture was cancelled.', 'AbortError')
    const { captureStills } = await import('@/features/immersive')
    return captureStills(input)
  })
  chain = run.catch(() => {})
  return run
}

/** Whether an error is a capture that was cancelled, which no one needs to hear about. */
export const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

/**
 * The posters of a recipe, rendered in this browser with the live preview
 * paused for the moment it takes, so the capture has the GPU to itself.
 */
async function posters({ id, effect, recipe, ground }: StillSource) {
  const key = sessionKey(id)
  const snapshot = snapshotRecipe(effectOf(effect), recipe)
  const wasPaused = studioStore.read(key).paused
  studioStore.patch(key, { paused: true })
  try {
    const images: Blob[] = []
    for (const surface of SURFACES)
      images.push(
        ...(await captureSerial({
          effect,
          tuning: snapshot[surface],
          frames: [snapshot.frame],
          capture: { ...POSTER_CAPTURE, surface },
          ground,
        })),
      )
    return images
  } finally {
    studioStore.patch(key, { paused: wasPaused })
  }
}

/** One still of the draft, rendered here. */
async function still({ effect, recipe, ground }: StillSource, target: Still) {
  const shot = stillShot(effectOf(effect), recipe, target)
  const [image] = await captureSerial({
    effect,
    tuning: shot.tuning(shot.seed),
    frames: [shot.frame],
    capture: shot.capture,
    ground,
  })
  return image
}

/**
 * One multipart request: the stills travel as the files they are, beside the
 * JSON fields. A still over the budget is stopped here, where the reason can be
 * said, since the platform refuses it with a body that is not JSON.
 */
async function send<T>(
  id: number | string,
  action: string,
  fields: Record<string, unknown>,
  images: Record<string, Blob>,
): Promise<T> {
  const weight = Object.values(images).reduce((sum, image) => sum + image.size, 0)
  if (weight > STILL_UPLOAD_BUDGET)
    throw new Error(
      `The rendered stills weigh ${(weight / 1024 / 1024).toFixed(1)} MB, over the 4 MB one upload can carry. Choose JPEG or a smaller size.`,
    )
  const form = new FormData()
  for (const [name, value] of Object.entries(fields)) form.set(name, JSON.stringify(value))
  for (const [name, image] of Object.entries(images)) form.set(name, image)
  const response = await fetch(`/api/${LOOKS_SLUG}/${id}/${action}`, { method: 'POST', body: form })
  const result = await response.json().catch(() => null)
  if (!response.ok)
    throw new Error(
      result?.errors?.[0]?.message ?? result?.error ?? `The request failed (${response.status}).`,
    )
  return result.doc
}

/** The server renders nothing and publishes the saved draft, so the draft is saved before anything is rendered from it. */
async function saveDraft(submit: Submit, { id, effect, recipe, stills }: StillSource) {
  validateRecipe(effectOf(effect), recipe)
  validateStills(effectOf(effect), recipe, stills)
  const saved = await submit({
    action: `/api/${LOOKS_SLUG}/${id}?draft=true`,
    method: 'PATCH',
    overrides: { _status: 'draft' },
    disableSuccessStatus: true,
  })
  if (!saved?.res.ok) throw new Error('The draft could not be saved, so nothing was published.')
}

/** One still of the saved draft, rendered and filed in Media. */
async function fileStill(draft: StillSource, target: Still): Promise<Media> {
  const image = await still(draft, target)
  return send<Media>(draft.id, 'stills', { recipe: draft.recipe, still: target }, { image })
}

/** Render: one still, filed in Media so it can be opened, downloaded and published. */
export async function renderStill(
  submit: Submit,
  draft: StillSource,
  target: Still,
): Promise<Media> {
  await saveDraft(submit, draft)
  return fileStill(draft, target)
}

export type PublishProgress = (step: string) => void

/**
 * Publish: save, render here what the site needs that is not already
 * published as the draft has it (the two posters always, each still whose
 * pixels moved), file each still, and publish the look with everything in one
 * request. Every place that uses the look shows the result.
 */
export async function publishLook(
  submit: Submit,
  draft: StillSource,
  live: PublishedState | null,
  onProgress: PublishProgress = () => {},
) {
  await saveDraft(submit, draft)
  const { status } = draftState(
    effectOf(draft.effect),
    draft.recipe,
    draft.ground,
    draft.stills,
    live,
  )
  const renders: Record<string, number> = {}
  const pending = draft.stills.filter((target) => status(target) !== 'live')
  for (const [index, target] of pending.entries()) {
    onProgress(`Rendering ${stillLabel(target)} (${index + 1} of ${pending.length})…`)
    const media = await fileStill(draft, target)
    renders[target.id] = media.id
  }
  onProgress('Rendering posters…')
  const images = await posters(draft)
  onProgress('Publishing…')
  return send<StreakLook>(
    draft.id,
    'publish',
    { recipe: draft.recipe, renders },
    Object.fromEntries(SURFACES.map((surface, index) => [surface, images[index]])),
  )
}

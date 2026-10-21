import { canonicalJSON } from '@/utilities/canonicalJSON'
import { resolveTuning } from '../resolve-tuning'
import { type EffectContract, parameterError, SURFACES, type Surface, type Tuning } from './effect'
import { type LookGround, studioGround } from './ground'
import { type CaptureOptions, FRAME_MAX, type Recipe, SEED_MAX, validateCapture } from './recipe'

/**
 * A still is a shot of a look for one use: a static render with its own
 * frame, seed, moment and face, and a bounded set of parameter overrides on
 * top of the live recipe. The live look is drawn with content over it, so it
 * can afford to be sparse; a still stands on its own, so it may be denser or
 * brighter without touching what the site runs live. A look stores its stills
 * beside the recipe (`stills`), the Studio renders them in the editor's
 * browser on Publish, and the published look carries each one's output.
 *
 * The poster pair is not a still here: it is the look exactly as it runs,
 * rendered on both faces with alpha, and its seed and frame are the recipe's.
 */

/** A use is a size with a purpose. The site serves the ones marked `site` by itself. */
export type StillUseSpec = {
  label: string
  /** One line for the editor: what the still is for and who shows it. */
  description: string
  width: number
  height: number
  /** A visual slot that uses the look receives this still, and the site serves it. */
  site?: true
  /** A look holds at most one of these. */
  single?: true
}

export const STILL_USES = {
  preview: {
    label: 'Preview card',
    description:
      'The share image for links to a page that opens on this look, unless the page sets its own in its SEO tab. Open Graph, 1200 × 630.',
    width: 1200,
    height: 630,
    site: true,
    single: true,
  },
  social: {
    label: 'Social post',
    description: 'A feed post, 4:5 portrait at 1080 × 1350. Download it from here.',
    width: 1080,
    height: 1350,
  },
  square: {
    label: 'Square post',
    description: 'A square post or avatar at 1080 × 1080. Download it from here.',
    width: 1080,
    height: 1080,
  },
  story: {
    label: 'Story',
    description: 'A vertical story at 1080 × 1920. Download it from here.',
    width: 1080,
    height: 1920,
  },
  custom: {
    label: 'Custom size',
    description: 'Any size from 320 to 1920 logical pixels per side, with or without alpha.',
    width: 1800,
    height: 1200,
  },
} as const satisfies Record<string, StillUseSpec>

export type StillUse = keyof typeof STILL_USES
export const STILL_USE_IDS = Object.keys(STILL_USES) as StillUse[]
export const isStillUse = (value: unknown): value is StillUse =>
  typeof value === 'string' && Object.hasOwn(STILL_USES, value)

/** The uses a visual slot receives from a published look, in the shape the slot reads. */
export const SITE_STILL_USES = STILL_USE_IDS.filter(
  (use) => (STILL_USES[use] as StillUseSpec).site,
) as SiteStillUse[]
export type SiteStillUse = {
  [U in StillUse]: (typeof STILL_USES)[U] extends { site: true } ? U : never
}[StillUse]

export type StillFormat = 'webp' | 'jpeg'

/** What the author stores for a still. Everything an editor can set. */
export type Still = {
  /** Stable within the look; the published output is keyed by it. */
  id: string
  use: StillUse
  /** A name of the editor's own; a custom still has no use to name it. */
  label?: string
  surface: Surface
  width: number
  height: number
  scale: 1 | 2
  format: StillFormat
  /** Keep alpha instead of flattening onto the face's ground. Custom only. */
  transparent: boolean
  seed: number
  frame: number
  /** Overrides on the live recipe, by parameter name: a still may be denser or brighter than the look that runs live. */
  deltas: Tuning
}

/** A still as the published look carries it: the input and its rendered output. */
export type PublishedStill = Still & {
  /** The rendered file, in Media. */
  media: number
  /** `sha256(stillKey(...))` of what was rendered: equal hashes draw equal pixels. */
  hash: string
}

const STILL_ID = /^[a-z0-9]{6,12}$/
const STILL_KEYS = [
  'id',
  'use',
  'label',
  'surface',
  'width',
  'height',
  'scale',
  'format',
  'transparent',
  'seed',
  'frame',
  'deltas',
] as const
const OUTPUT_KEYS = ['media', 'hash'] as const

/** Eight random characters from the id's own alphabet, drawn with the platform's entropy. */
export const newStillId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => (byte % 36).toString(36)).join('')

/** A new still for a use: the look as it is, at the use's size, on the dark face. */
export function newStill(recipe: Recipe, use: StillUse, id = newStillId()): Still {
  const spec = STILL_USES[use]
  return {
    id,
    use,
    ...(use === 'custom' ? { label: 'Custom' } : {}),
    surface: 'dark',
    width: spec.width,
    height: spec.height,
    scale: 1,
    format: 'webp',
    transparent: false,
    seed: recipe.seed,
    frame: recipe.frame,
    deltas: {},
  }
}

/** The capture a still renders as: its size, scale, face and encoding. */
export const stillCapture = (still: Still): CaptureOptions => ({
  width: still.width,
  height: still.height,
  scale: still.scale,
  surface: still.surface,
  format: still.format,
  transparent: still.transparent,
})

/** How a still reads in a list: its use, or the editor's own name for a custom one. */
export const stillLabel = (still: Still) =>
  still.use === 'custom'
    ? still.label?.trim() || STILL_USES.custom.label
    : STILL_USES[still.use].label

/** The still's inputs alone, as the draft stores them: a published still's output is left out. */
export function stillInputs(still: Still | PublishedStill): Still {
  const inputs = {} as Record<string, unknown>
  for (const key of STILL_KEYS) if (still[key] !== undefined) inputs[key] = still[key]
  return inputs as Still
}

const isOutput = (value: unknown): value is Pick<PublishedStill, 'media' | 'hash'> => {
  const still = value as Partial<PublishedStill>
  return (
    Number.isInteger(still.media) &&
    typeof still.hash === 'string' &&
    /^[a-f0-9]{64}$/.test(still.hash)
  )
}

/** The published stills in a stored value, with their outputs; a row without one is left out. */
export const publishedStills = (raw: unknown): PublishedStill[] =>
  Array.isArray(raw) ? raw.filter((still): still is PublishedStill => isOutput(still)) : []

/**
 * The resolved tuning a still draws: the recipe's deltas, the still's own on
 * top, its seed, the face it is for, and the most generous placement's caps,
 * the way a poster is drawn. Never checks ranges; `validateStills` does.
 */
export function stillTuning<T extends Tuning>(
  effect: EffectContract<T>,
  recipe: Recipe,
  still: Still,
): T {
  const base = resolveTuning<T>(effect.defaults, {
    ...recipe.deltas,
    ...still.deltas,
    ...(effect.seeded ? { seed: still.seed } : {}),
  } as Partial<T>)
  return effect.limit(effect.face(base, still.surface), 'hero')
}

/**
 * The identity of what a still renders, in canonical form: the renderer, the
 * resolved tuning, the moment, the frame geometry, the encoding and the ground
 * a filled still is laid over. The published still stores its SHA-256; the
 * Studio compares drafts to published states over the same string.
 */
export function stillKey<T extends Tuning>(
  effect: EffectContract<T>,
  recipe: Recipe,
  still: Still,
  ground: LookGround,
): string {
  return canonicalJSON({
    renderer: effect.renderer,
    tuning: stillTuning(effect, recipe, still),
    frame: still.frame,
    width: still.width,
    height: still.height,
    scale: still.scale,
    format: still.format,
    ground: still.transparent ? null : studioGround(ground, still.surface),
  })
}

/** The one rule a still's shape has to meet before its values are read. */
function stillShape(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('A still is an object.')
  const value = raw as Record<string, unknown>
  const known = [...STILL_KEYS, ...OUTPUT_KEYS] as readonly string[]
  const unknown = Object.keys(value).find((key) => !known.includes(key))
  if (unknown) throw new Error(`Unknown still property: ${unknown}.`)
  if (typeof value.id !== 'string' || !STILL_ID.test(value.id))
    throw new Error('A still id is 6 to 12 lowercase letters and digits.')
  if (!isStillUse(value.use)) throw new Error(`Unknown still use: ${String(value.use)}.`)
  if (value.label !== undefined && (typeof value.label !== 'string' || value.label.length > 80))
    throw new Error('A still label is up to 80 characters.')
  if (!(SURFACES as readonly unknown[]).includes(value.surface))
    throw new Error('A still is for the dark or the light face.')
  return value
}

/** The frame a still renders in: the capture's own rules, then the use's size and fill. */
function stillFrame(value: Record<string, unknown>): CaptureOptions {
  const capture = validateCapture({
    width: value.width,
    height: value.height,
    scale: value.scale,
    surface: value.surface,
    format: value.format,
    transparent: value.transparent,
  })
  if (value.use === 'custom') return capture
  const spec = STILL_USES[value.use as StillUse]
  if (capture.width !== spec.width || capture.height !== spec.height)
    throw new Error(`A ${spec.label} still is ${spec.width} × ${spec.height}.`)
  if (capture.transparent) throw new Error(`A ${spec.label} still is always filled.`)
  return capture
}

/** The moment and the arrangement: a still's seed and frame share the recipe's ranges. */
function stillMoment(value: Record<string, unknown>) {
  if (!Number.isInteger(value.seed) || Number(value.seed) < 0 || Number(value.seed) > SEED_MAX)
    throw new Error('A still seed must be a nonnegative 31-bit integer.')
  if (!Number.isInteger(value.frame) || Number(value.frame) < 1 || Number(value.frame) > FRAME_MAX)
    throw new Error(`A still frame must be between 1 and ${FRAME_MAX}.`)
}

/** A still's overrides: authorable parameters in range, and the effect's cross-parameter rules on the result. */
function stillOverrides<T extends Tuning>(
  effect: EffectContract<T>,
  recipe: Recipe,
  deltas: unknown,
): Tuning {
  if (!deltas || typeof deltas !== 'object' || Array.isArray(deltas))
    throw new Error('Still overrides must be an object.')
  for (const [key, val] of Object.entries(deltas)) {
    if (!Object.hasOwn(effect.parameters, key)) throw new Error(`Unsupported parameter: ${key}`)
    const error = parameterError(key, effect.parameters[key], val)
    if (error) throw new Error(error)
  }
  effect.check?.(
    resolveTuning<T>(effect.defaults, { ...recipe.deltas, ...(deltas as Tuning) } as Partial<T>),
  )
  return deltas as Tuning
}

function validateStill<T extends Tuning>(effect: EffectContract<T>, recipe: Recipe, raw: unknown) {
  const value = stillShape(raw)
  stillFrame(value)
  stillMoment(value)
  stillOverrides(effect, recipe, value.deltas)
  return value as unknown as Still
}

/**
 * The stills a look may store, each checked against the effect and the recipe
 * they sit on. Throws the message the editor reads. Outputs (`media`, `hash`)
 * are passed through for the publish path to verify; everything else is held
 * to its range. An empty or missing list is no stills.
 */
export function validateStills<T extends Tuning>(
  effect: EffectContract<T>,
  recipe: Recipe,
  raw: unknown,
): (Still | PublishedStill)[] {
  if (raw === null || raw === undefined) return []
  if (!Array.isArray(raw)) throw new Error('Stills must be a list.')
  if (raw.length > 12) throw new Error('A look holds up to 12 stills.')
  const stills = raw.map((still) => validateStill(effect, recipe, still))
  const ids = new Set<string>()
  const singles = new Set<StillUse>()
  for (const still of stills) {
    if (ids.has(still.id)) throw new Error(`Two stills share the id ${still.id}.`)
    ids.add(still.id)
    const spec = STILL_USES[still.use] as StillUseSpec
    if (spec.single) {
      if (singles.has(still.use)) throw new Error(`A look holds one ${spec.label} still.`)
      singles.add(still.use)
    }
  }
  return stills
}

/** Whether two stored stills ask for the same render, outputs aside. */
export const sameStill = (a: Still | PublishedStill, b: Still | PublishedStill) =>
  canonicalJSON(stillInputs(a)) === canonicalJSON(stillInputs(b))

/** How many stills differ between two lists: added, removed or changed, by id. */
export function stillChanges(
  a: readonly (Still | PublishedStill)[],
  b: readonly (Still | PublishedStill)[],
): number {
  const byId = new Map(b.map((still) => [still.id, still]))
  let changes = 0
  for (const still of a) {
    const other = byId.get(still.id)
    if (!other || !sameStill(still, other)) changes++
    byId.delete(still.id)
  }
  return changes + byId.size
}

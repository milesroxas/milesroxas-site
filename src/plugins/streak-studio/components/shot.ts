import type { Effect, Surface, Tuning } from '@/features/immersive/studio/effect'
import type { LookGround } from '@/features/immersive/studio/ground'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  type Recipe,
  snapshotRecipe,
} from '@/features/immersive/studio/recipe'
import {
  type Still,
  stillCapture,
  stillLabel,
  stillTuning,
} from '@/features/immersive/studio/stills'

/**
 * What the stage renders when it shows a still rather than the live look: the
 * poster pair (the recipe exactly, one face at a time, with alpha) or one of
 * the look's stills. One description serves the still preview, the contact
 * sheet and the publish, so a render is the same pixels wherever it is asked
 * for.
 */
export type Shot = {
  label: string
  capture: CaptureOptions
  seed: number
  frame: number
  /** The resolved tuning for a seed: the sheet renders other seeds of the same shot. */
  tuning: (seed: number) => Tuning
}

export function posterShot(effect: Effect, recipe: Recipe, surface: Surface): Shot {
  return {
    label: 'Poster',
    capture: { ...POSTER_CAPTURE, surface },
    seed: recipe.seed,
    frame: recipe.frame,
    tuning: (seed) => snapshotRecipe(effect, { ...recipe, seed })[surface],
  }
}

export function stillShot(effect: Effect, recipe: Recipe, still: Still): Shot {
  return {
    label: stillLabel(still),
    capture: stillCapture(still),
    seed: still.seed,
    frame: still.frame,
    tuning: (seed) => stillTuning(effect, recipe, { ...still, seed }),
  }
}

/** The shot the stage shows for a selection, on the face the stage is set to. */
export const shotOf = (
  effect: Effect,
  recipe: Recipe,
  selection: 'poster' | Still,
  surface: Surface,
): Shot =>
  selection === 'poster'
    ? posterShot(effect, recipe, surface)
    : stillShot(effect, recipe, selection)

/** The capture a sheet thumbnail is rendered at: the shot's own frame, at a fraction of its pixels. */
export const sheetCapture = (shot: Shot, scale: number): CaptureOptions => ({
  ...shot.capture,
  scale,
  format: 'webp',
})

/** Everything a shot's render depends on, for a preview to know when to render again. */
export const shotIdentity = (shot: Shot, ground: LookGround) =>
  JSON.stringify([shot.capture, shot.frame, shot.tuning(shot.seed), ground])

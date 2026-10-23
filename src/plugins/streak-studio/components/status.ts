import type { Effect } from '@/features/immersive/studio/effect'
import { type LookGround, sameGround } from '@/features/immersive/studio/ground'
import { canonicalJSON, type Recipe, snapshotRecipe } from '@/features/immersive/studio/recipe'
import { type Still, sameStill, stillChanges } from '@/features/immersive/studio/stills'
import type { PublishedState } from './look-store'

/**
 * The draft read against what is published, for every piece of the Studio
 * that says so: the stage header, the Stills list, the Publish button and
 * the publish itself, which renders only what this says has changed.
 */

/** The draft's snapshot key, or nothing while the recipe is refused. */
function draftKey(effect: Effect, recipe: Recipe): string | null {
  try {
    return canonicalJSON(snapshotRecipe(effect, recipe))
  } catch {
    return null
  }
}

/** Whether the look's pixels, posters included, are what is published: the recipe and the ground. */
const lookMatches = (
  key: string | null,
  ground: LookGround,
  state: PublishedState | null | undefined,
): state is PublishedState =>
  Boolean(state && key && state.key === key && sameGround(state.ground, ground))

/**
 * Where a still stands: `live` is on the site as the draft has it, `changed`
 * is published but will re-render on publish (its own settings, the recipe
 * under it or the ground it is laid on moved), `new` was never published.
 */
export type StillStatus = 'live' | 'changed' | 'new'

function stillStatus(
  still: Still,
  live: PublishedState | null,
  unchangedLook: boolean,
): StillStatus {
  const published = live?.stills.find((candidate) => candidate.id === still.id)
  if (!published) return 'new'
  return unchangedLook && sameStill(published, still) ? 'live' : 'changed'
}

/** The whole draft against what is published: identical, or how many settings apart. */
export function draftState(
  effect: Effect,
  recipe: Recipe,
  ground: LookGround,
  stills: Still[],
  live: PublishedState | null,
) {
  const key = draftKey(effect, recipe)
  const unchangedLook = lookMatches(key, ground, live)
  const stillsApart = live ? stillChanges(stills, live.stills) : stills.length
  return {
    key,
    unchangedLook,
    unchanged: unchangedLook && stillsApart === 0,
    stillsApart,
    status: (still: Still) => stillStatus(still, live, unchangedLook),
  }
}

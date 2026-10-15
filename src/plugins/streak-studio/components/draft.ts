'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import {
  DEFAULT_EFFECT,
  type EffectId,
  effectOf,
  isEffectId,
} from '@/features/immersive/studio/effects'
import { type LookGround, lookGround } from '@/features/immersive/studio/ground'
import { emptyRecipe, type Recipe, validateRecipe } from '@/features/immersive/studio/recipe'
import { EFFECT_FIELD, GROUND_FIELD, RECIPE_FIELD } from './paths'
import { sessionKey, studioStore } from './store'

/**
 * The look's draft: the recipe field of the open document, which Payload
 * autosaves, read against the effect the look is filed under. Every piece of
 * the Studio that changes it goes through `update`, so each change is one undo
 * step and puts the draft back on the stage.
 */
/**
 * The look's own ground, one face at a time, from the hidden group in the
 * same form. It rides beside the recipe, not inside it: a change here is not
 * an undo step, autosaves with the draft, and reaches the site on Publish.
 */
export function useGround() {
  const dark = useField<string | null>({ path: `${GROUND_FIELD}.dark` })
  const light = useField<string | null>({ path: `${GROUND_FIELD}.light` })
  const ground: LookGround = lookGround({ dark: dark.value, light: light.value })
  return {
    ground,
    set: (surface: keyof LookGround, next: string | null) =>
      (surface === 'dark' ? dark : light).setValue(next),
    /** Both faces at once, as a published state carries them: a face it leaves out is cleared. */
    replace: (next: LookGround) => {
      dark.setValue(next.dark ?? null)
      light.setValue(next.light ?? null)
    },
  }
}

export function useDraft(path: string = RECIPE_FIELD) {
  const { value, setValue, errorMessage } = useField<Recipe>({ path })
  const stored = useField<EffectId>({ path: EFFECT_FIELD })
  const { id } = useDocumentInfo()
  const key = sessionKey(id)
  const effectId = isEffectId(stored.value) ? stored.value : DEFAULT_EFFECT
  const effect = effectOf(effectId)
  const recipe = value ?? emptyRecipe(effect)

  const update = (next: Recipe, restart = false) => {
    studioStore.record(key, recipe)
    setValue(next)
    if (restart) studioStore.restart(key)
  }

  return {
    id,
    key,
    effectId,
    effect,
    recipe,
    errorMessage,
    setValue,
    update,
    /**
     * Make a published state the draft. Nothing on the site changes until the
     * draft is published. Throws for a recipe today's ranges no longer accept.
     */
    restore: (published: Recipe) => update(validateRecipe(effect, published), true),
    /**
     * File the look under another effect. A recipe is only ever read against
     * the effect it was written for, so the draft starts over and the undo
     * stack, which holds the other effect's recipes, goes with it. The server
     * allows this until the look is first published.
     */
    changeEffect: (next: EffectId) => {
      studioStore.clear(key)
      stored.setValue(next)
      setValue(emptyRecipe(effectOf(next)))
    },
  }
}

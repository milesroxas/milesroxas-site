/**
 * Field names the Studio components read from the look document's form.
 * The collection config and every client component that calls `useField`
 * for them import from here, so the name is stated once.
 */
export const RECIPE_FIELD = 'recipe'
/** Which effect the look is filed under: the contract its recipe is read against. */
export const EFFECT_FIELD = 'effect'
/** The look's own ground per face (`@/features/immersive/studio/ground`), a group of `dark` and `light`. */
export const GROUND_FIELD = 'ground'

export const LOOKS_SLUG = 'streak-looks'

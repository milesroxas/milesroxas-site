import { describe, expect, it } from 'vitest'
import { STREAK_FIELD_EFFECT as S } from '@/features/immersive/studio/effects'
import { canonicalJSON, emptyRecipe, snapshotRecipe } from '@/features/immersive/studio/recipe'
import { newStill } from '@/features/immersive/studio/stills'
import type { PublishedState } from './look-store'
import { draftState } from './status'

const recipe = emptyRecipe(S)
const preview = newStill(recipe, 'preview', 'abc123')
const published = (overrides: Partial<PublishedState> = {}): PublishedState => ({
  id: 'live',
  at: '2026-10-21T00:00:00Z',
  recipe,
  key: canonicalJSON(snapshotRecipe(S, recipe)),
  ground: {},
  stills: [{ ...preview, media: 4, hash: 'a'.repeat(64) }],
  poster: null,
  renders: new Map(),
  ...overrides,
})

describe('the draft against what is published', () => {
  it('is unchanged when the recipe, the ground and every still are what the site has', () => {
    const state = draftState(S, recipe, {}, [preview], published())
    expect(state.unchanged).toBe(true)
    expect(state.status(preview)).toBe('live')
  })

  it('re-renders every still when the look under it or its ground moves', () => {
    const moved = draftState(S, { ...recipe, seed: 9 }, {}, [preview], published())
    expect(moved.unchangedLook).toBe(false)
    expect(moved.stillsApart).toBe(0)
    expect(moved.status(preview)).toBe('changed')
    const grounded = draftState(S, recipe, { dark: '#000000' }, [preview], published())
    expect(grounded.status(preview)).toBe('changed')
  })

  it('counts a still’s own change, and knows one the site has never seen', () => {
    const social = newStill(recipe, 'social', 'abc124')
    const state = draftState(S, recipe, {}, [{ ...preview, frame: 9 }, social], published())
    expect(state.unchanged).toBe(false)
    expect(state.stillsApart).toBe(2)
    expect(state.status({ ...preview, frame: 9 })).toBe('changed')
    expect(state.status(social)).toBe('new')
    expect(draftState(S, recipe, {}, [social], null).stillsApart).toBe(1)
  })

  it('reads an invalid recipe as not published', () => {
    const state = draftState(S, { ...recipe, deltas: { count: 10 } }, {}, [], published())
    expect(state.key).toBeNull()
    expect(state.unchanged).toBe(false)
  })
})

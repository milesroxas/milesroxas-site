import { describe, expect, it } from 'vitest'
import { STUDIO_GROUND } from './effect'
import { LIGHT_LEAK_EFFECT as L, STREAK_FIELD_EFFECT as S } from './effects'
import { emptyRecipe, resolveRecipeTuning, snapshotRecipe } from './recipe'
import { parseRelease } from './release'
import {
  newStill,
  publishedStills,
  SITE_STILL_USES,
  STILL_USES,
  sameStill,
  stillChanges,
  stillInputs,
  stillKey,
  stillTuning,
  validateStills,
} from './stills'

const recipe = { ...emptyRecipe(S), deltas: { count: 900, brightness: 0.8 } }

describe('a still', () => {
  it('starts as the look is, at its use’s size, on the dark face', () => {
    const still = newStill(recipe, 'preview', 'abc123')
    expect(still).toEqual({
      id: 'abc123',
      use: 'preview',
      surface: 'dark',
      width: STILL_USES.preview.width,
      height: STILL_USES.preview.height,
      scale: 1,
      format: 'webp',
      transparent: false,
      seed: recipe.seed,
      frame: recipe.frame,
      deltas: {},
    })
    expect(newStill(recipe, 'custom', 'abc123').label).toBe('Custom')
    expect(validateStills(S, recipe, [still])).toEqual([still])
  })

  it('draws the look with its overrides on top, for its face, at the hero caps', () => {
    const still = { ...newStill(recipe, 'social', 'abc123'), seed: 7, deltas: { count: 4000 } }
    const tuning = stillTuning(S, recipe, still)
    expect(tuning.count).toBe(4000)
    expect(tuning.brightness).toBe(0.8)
    expect(tuning.seed).toBe(7)
    // The light face takes the paper treatment, as a poster does.
    const light = stillTuning(S, recipe, { ...still, surface: 'light' })
    expect(light.surface).toBe('light')
    expect(light.brightness).toBe(snapshotRecipe(S, recipe).light.brightness)
    // Nothing a still can ask for passes what the hero may draw.
    const capped = stillTuning(S, recipe, { ...still, deltas: { count: 8000, noise: 'curl' } })
    expect(capped.count).toBeLessThanOrEqual(4000)
  })

  it('has an identity that moves with its pixels and nothing else', () => {
    const still = newStill(recipe, 'preview', 'abc123')
    const key = stillKey(S, recipe, still, {})
    expect(stillKey(S, recipe, { ...still, label: 'x' }, {})).toBe(key)
    expect(stillKey(S, recipe, still, { light: '#ffffff' })).toBe(key)
    expect(stillKey(S, recipe, still, { dark: '#000000' })).not.toBe(key)
    expect(stillKey(S, recipe, { ...still, frame: 2 }, {})).not.toBe(key)
    expect(stillKey(S, recipe, { ...still, seed: 2 }, {})).not.toBe(key)
    expect(stillKey(S, recipe, { ...still, scale: 2 }, {})).not.toBe(key)
    expect(stillKey(S, { ...recipe, deltas: { count: 1000 } }, still, {})).not.toBe(key)
    // An override that restates what the recipe already resolves to is the same still.
    expect(stillKey(S, recipe, { ...still, deltas: { count: 900 } }, {})).toBe(key)
    // A transparent custom still is laid on no ground, so the ground is not in its key.
    const custom = { ...newStill(recipe, 'custom', 'abc123'), transparent: true }
    expect(stillKey(S, recipe, custom, { dark: '#000000' })).toBe(stillKey(S, recipe, custom, {}))
    expect(JSON.parse(key).ground).toBe(STUDIO_GROUND.dark)
  })

  it.each([
    [{ id: 'A' }, 'id'],
    [{ use: 'banner' }, 'use'],
    [{ surface: 'auto' }, 'face'],
    [{ width: 100 }, '320 to 1920'],
    [{ width: 1201 }, '1200 × 630'],
    [{ transparent: true }, 'always filled'],
    [{ scale: 3 }, '1x or 2x'],
    [{ format: 'png' }, 'format'],
    [{ seed: -1 }, 'seed'],
    [{ frame: 0 }, 'frame'],
    [{ deltas: { dpr: 2 } }, 'Unsupported parameter'],
    [{ deltas: { count: 100000 } }, 'between'],
    [{ deltas: { minLength: 50, maxLength: 2 } }, 'Minimum length'],
    [{ extra: 1 }, 'Unknown still property'],
    [{ label: 'x'.repeat(81) }, '80 characters'],
  ])('refuses %o', (patch, reason) => {
    const still = { ...newStill(recipe, 'preview', 'abc123'), ...patch }
    expect(() => validateStills(S, recipe, [still])).toThrow(reason)
  })

  it('passes a published still’s output through for the publish path', () => {
    const still = { ...newStill(recipe, 'preview', 'abc123'), media: 4, hash: 'a'.repeat(64) }
    expect(validateStills(S, recipe, [still])).toEqual([still])
    expect(stillInputs(still)).not.toHaveProperty('media')
    expect(publishedStills([still, newStill(recipe, 'social')])).toEqual([still])
    expect(publishedStills([{ ...still, hash: 'short' }])).toEqual([])
  })

  it('holds one preview, unique ids, and twelve stills at most', () => {
    const preview = newStill(recipe, 'preview', 'abc123')
    expect(() =>
      validateStills(S, recipe, [preview, newStill(recipe, 'preview', 'abc124')]),
    ).toThrow('one Preview card')
    expect(() =>
      validateStills(S, recipe, [preview, newStill(recipe, 'social', 'abc123')]),
    ).toThrow('share the id')
    expect(() =>
      validateStills(
        S,
        recipe,
        Array.from({ length: 13 }, (_, i) => newStill(recipe, 'custom', `custom${i}`)),
      ),
    ).toThrow('up to 12')
    expect(validateStills(S, recipe, null)).toEqual([])
    expect(() => validateStills(S, recipe, {})).toThrow('list')
  })

  it('counts what changed between two lists, by id, outputs aside', () => {
    const a = newStill(recipe, 'preview', 'abc123')
    const b = newStill(recipe, 'social', 'abc124')
    expect(sameStill(a, { ...a, media: 1, hash: 'a'.repeat(64) })).toBe(true)
    expect(stillChanges([a, b], [a, b])).toBe(0)
    expect(stillChanges([{ ...a, seed: 9 }, b], [a, b])).toBe(1)
    expect(stillChanges([a], [a, b])).toBe(1)
    expect(stillChanges([a, b], [])).toBe(2)
  })

  it('works the same for a seedless effect', () => {
    const leak = emptyRecipe(L)
    const still = newStill(leak, 'story', 'abc123')
    expect(validateStills(L, leak, [still])).toEqual([still])
    expect(stillTuning(L, leak, still).blendMode).toBe(
      L.face(resolveRecipeTuning(L, leak), 'dark').blendMode,
    )
  })
})

describe('a release with stills', () => {
  const poster = {
    filename: 'studio.webp',
    url: '/api/media/file/studio.webp',
    mimeType: 'image/webp',
    width: 1600,
    height: 900,
    updatedAt: '2026-09-17T00:00:00Z',
  }
  const release = () => ({
    id: 7,
    sourceHash: 'a'.repeat(64),
    snapshot: snapshotRecipe(S, emptyRecipe(S)),
    posters: { dark: poster, light: poster },
  })

  it('serves only the uses the site reads, and drops one that does not parse', () => {
    expect(SITE_STILL_USES).toEqual(['preview'])
    const preview = { ...poster, width: 1200, height: 630 }
    const parsed = parseRelease(S, { ...release(), stills: { preview, social: preview } })
    expect(parsed?.stills).toEqual({ preview })
    expect(
      parseRelease(S, { ...release(), stills: { preview: { url: 'x' } } })?.stills,
    ).toBeUndefined()
    expect(parseRelease(S, release())?.stills).toBeUndefined()
  })

  it('never refuses a release over its stills', () => {
    expect(parseRelease(S, { ...release(), stills: 'nonsense' })).not.toBeNull()
  })
})

describe('a new still id', () => {
  it('is one the validator accepts', async () => {
    const { newStillId } = await import('./stills')
    for (let i = 0; i < 20; i++) expect(newStillId()).toMatch(/^[a-z0-9]{6,12}$/)
  })
})

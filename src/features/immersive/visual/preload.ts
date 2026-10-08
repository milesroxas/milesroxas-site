'use client'

import type { EffectVisual } from './descriptor'
import { isMotionPaused } from './motion-preference'
import { placementAllowsLive } from './rollout'

const POSTER_ONLY_QUERY =
  '(prefers-reduced-motion: reduce), (any-pointer: coarse) and (hover: none)'

/**
 * Starts fetching a hero effect's live runtime before its slot mounts, so a
 * page transition's wait covers the download. Skipped wherever the slot would
 * stay a poster anyway (`useLiveVisual`'s policy, preference and device gates).
 */
export function preloadVisualRuntime(kind: EffectVisual['kind']) {
  if (!placementAllowsLive('hero') || isMotionPaused() || matchMedia(POSTER_ONLY_QUERY).matches)
    return
  const runtime =
    kind === 'streakField'
      ? import('../ui/streak-field-runtime')
      : import('../ui/light-leak-runtime')
  // The slot's own lazy import reports a chunk that fails.
  runtime.catch(() => {})
}

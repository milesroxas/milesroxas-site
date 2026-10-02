/**
 * Light entry for the visual contract: the effects a slot can choose, look
 * ids, descriptors, resolvers and placements. No Three, R3F or DOM imports,
 * so the Payload config, server components and validation hooks can use it.
 * A live runtime is reached only through its effect's client slot
 * (`StreakVisual`, `LeakVisual`), which imports it on demand.
 */
export { type Effect, isLookId, type Surface } from '../studio/effect'
export {
  DEFAULT_EFFECT,
  EFFECT_IDS,
  EFFECT_OPTIONS,
  EFFECTS,
  type EffectId,
  effectOf,
  isEffectId,
} from '../studio/effects'
export { LEAK_EXCITE_TARGETS, LEAK_ORIGINS } from '../ui/light-leak-tuning'
export {
  type EffectVisual,
  isValidStreakSeed,
  LEAK_SECTION_HOVER_RANGE,
  resolveOpening,
  resolveVisual,
  STREAK_INTENSITY_RANGE,
  STREAK_SEED_MAX,
  STREAK_SPEED_RANGE,
  type StoredVisualSlot,
  VISUAL_SURFACES,
  type Visual,
  type VisualSurface,
} from './descriptor'
export { VISUAL_HOST } from './host'
export { LeakVisual } from './leak-visual'
export type { VisualPlacement } from './placement'
export { StreakVisual } from './streak-visual'

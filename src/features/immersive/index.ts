/**
 * Immersive stack (FSD: **feature**): the Studio effects (Streak Field and
 * light leak), their shipped looks, and the Studio's capture and preview.
 * Infrastructure remains under `@/lib/webgl`. Ported from sas-site with the
 * effects this site does not ship (text load-ins, refraction, dispersion,
 * floating cards, scroll gallery, backdrop) left behind.
 */
export {
  LIGHT_LEAK_AMBER,
  LIGHT_LEAK_PAPER,
  STREAK_FIELD_BACKDROP,
  STREAK_FIELD_DEPTH_MAP,
  STREAK_FIELD_PAPER,
  STREAK_FIELD_TECHNICAL_B2B,
  STREAK_FIELD_TECHNICAL_LINES,
  STREAK_FIELD_TOPOGRAPHY,
} from './presets'
export { captureStill } from './studio/capture'
export { StudioPreview } from './studio/preview'
export {
  LEAK_EXCITE_TARGETS,
  type LeakExciteTargets,
  LIGHT_LEAK_DEFAULTS,
  LightLeak,
  type LightLeakBlendMode,
  type LightLeakProps,
  type LightLeakTint,
} from './ui/light-leak'
export {
  LIGHT_LEAK_EXCITE_ATTR,
  LIGHT_LEAK_INTERACTIVE_SELECTOR,
  LIGHT_LEAK_SCOPE_ATTR,
  leakExcite,
  leakScope,
} from './ui/light-leak-excite'
export {
  STREAK_FIELD_DEFAULTS,
  STREAK_FIELD_NOISES,
  StreakField,
  type StreakFieldInk,
  type StreakFieldLayout,
  type StreakFieldMotion,
  type StreakFieldNoise,
  type StreakFieldProps,
  type StreakFieldShape,
  type StreakFieldSurface,
} from './ui/streak-field'

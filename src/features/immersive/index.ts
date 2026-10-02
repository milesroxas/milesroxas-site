/**
 * Immersive stack (FSD: **feature**): the Studio effects (Streak Field and
 * light leak) and their shipped looks. This entry is the Studio's capture and
 * preview, which the Studio plugin loads on demand; slots reach the effects
 * through `./visual`. Infrastructure remains under `@/lib/webgl`. Ported from
 * sas-site with the effects this site does not ship (text load-ins,
 * refraction, dispersion, floating cards, scroll gallery, backdrop) left
 * behind.
 */
export { captureStill } from './studio/capture'
export { StudioPreview } from './studio/preview'

import type { CSSProperties } from 'react'

/**
 * Every timing the index owns, in one place. The plate's transition is long
 * and in-out on purpose: two pictures share the frame while it runs, and it
 * should read as a considered change of plate, not a flicker. Script reads
 * these directly; markup reads them as the custom properties below.
 */
export const MORE_WORK_MOTION = {
  /** How long the pointer rests on a row before the plate follows it. */
  hoverIntent: 100,
  plate: { duration: 1100, ease: [0.65, 0, 0.35, 1] },
  /** A row's ink, rule and arrow. */
  ink: 360,
  /** The plain plate's crossfade, where there is no canvas. */
  swap: 520,
} as const

export const moreWorkMotionStyle = {
  '--more-work-ink': `${MORE_WORK_MOTION.ink}ms`,
  '--more-work-swap': `${MORE_WORK_MOTION.swap}ms`,
} as CSSProperties

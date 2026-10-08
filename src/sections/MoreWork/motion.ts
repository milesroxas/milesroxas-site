import type { CSSProperties } from 'react'

/**
 * Every timing the plate and its indexes own, in one place: More work and the
 * works dial share them. Script reads these directly; markup reads them as
 * the custom properties below.
 */
export const MORE_WORK_MOTION = {
  /**
   * The plate's wave: long, so two pictures sharing the frame read as a
   * considered change of plate, not a flicker. It moves the moment a row is
   * chosen, with no slow start, and spends most of its length settling. Its
   * curve follows what leads the plate (`PlateLead`): the pointer's opens
   * faster, so the plate answers the row it enters; the scroll's is calmer.
   * A row that lands mid-wave never cuts it: over `hurryRamp` ms the running
   * wave quickens by `hurry`, under the new row's wave (pointer) or ahead of
   * it (scroll).
   */
  plate: {
    duration: 1800,
    ease: { pointer: [0.2, 0.5, 0.1, 1], scroll: [0.3, 0.4, 0.12, 1] },
    hurry: 3,
    hurryRamp: 300,
  },
  /**
   * How the plate keeps pace with a pointer crossing the rows. At rest it
   * follows the row the pointer enters at once. Within `spacing` ms of its
   * last change it waits until the pointer has rested `settle` ms on one row,
   * so a quick pass carries the plate to the row it stops on in one wave,
   * not through every row it crossed. The rows' ink always answers at once.
   */
  pace: { settle: 180, spacing: 600 },
  /** A row's ink, rule and arrow. */
  ink: 360,
  /** The plain plate's crossfade, where there is no canvas. */
  swap: 520,
} as const

export const moreWorkMotionStyle = {
  '--more-work-ink': `${MORE_WORK_MOTION.ink}ms`,
  '--more-work-swap': `${MORE_WORK_MOTION.swap}ms`,
} as CSSProperties

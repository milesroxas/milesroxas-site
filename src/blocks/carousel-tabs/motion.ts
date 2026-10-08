/**
 * Every timing the deck swap owns. The wipe takes the More work plate's
 * length and in-out curve (`src/sections/MoreWork/motion.ts`), so a deck
 * changing reads as a considered change of plate, not a cut.
 */
export const DECK_SWAP_MOTION = {
  /** The shared edge's pass down the frame (s): the new deck above it, the old below. */
  wipe: { duration: 1.1, ease: 'power2.inOut' },
  /** Reduced motion: a crossfade in place of the wipe (s). */
  fade: 0.4,
  /** Longest the old deck holds while the new deck's first picture loads (ms). */
  hold: 900,
} as const

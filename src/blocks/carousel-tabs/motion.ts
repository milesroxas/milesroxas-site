/**
 * Every timing the deck swap owns. The dissolve runs on the More work
 * plate's length (`src/sections/MoreWork/motion.ts`), so a deck changing
 * reads as a considered change of plate, not a cut. Its curves are shaped
 * per deck in ./DeckPanels: the old deck eases out fast, the new one eases
 * in over the rest.
 */
export const DECK_SWAP_MOTION = {
  dissolve: {
    /** The whole swap (s). */
    duration: 1.1,
    /** Share of the swap by which the old deck has gone. */
    outBy: 0.5,
    /** Share of the swap at which the new deck starts to show. */
    inFrom: 0.12,
    /** Softness at the crossing (px): the bridge between the two decks. */
    blur: 6,
  },
  /** Reduced motion: the same dissolve, unblurred and shorter (s). */
  fade: 0.4,
  /** Longest the old deck holds while the new deck's first picture loads (ms). */
  hold: 900,
} as const

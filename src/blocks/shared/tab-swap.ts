/**
 * The tab swap's timing: the new copy drifts in from the side of travel and
 * the marker under the chosen tab travels on the same curve, so a switch
 * always reads as a response to the tap. Feature tabs cascades its copy on
 * these values (its picture paints in on its own clock, `feature/Tabs/look`).
 *
 * Kept apart from the scroll entrance on purpose: that wipes frames open from
 * the top and is first-seen language, while this travels along the keys.
 */
export const TAB_SWAP_MOTION = {
  /** `--ease-out-quint`: the change lands in the first third, then settles. */
  ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
  copy: {
    duration: 600,
    stagger: 50,
    /** Longest a burst of pieces takes to cascade (ms), as the scroll entrance caps it. */
    cascade: 400,
    travel: '0.75rem',
    blur: 4,
  },
  /** The seam under the chosen key (ms), on the deck index's thumb length. */
  ink: 500,
  /** Reduced motion: a plain crossfade, no travel, no blur (ms). */
  fade: 300,
} as const

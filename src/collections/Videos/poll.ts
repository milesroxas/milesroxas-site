/**
 * How the admin's encoding panel asks after a video (`VideoStatusField`).
 * Every ask is a pass over Stream, so the cadence is the cost: quick while
 * the editor watches a fresh save, slower once it is clearly a long encode,
 * and over after twenty minutes, when a button asks again on demand. Nothing
 * asks from a hidden or closed tab.
 */
export const POLL = {
  /** Between asks, for the first `fastFor` ms of a run. */
  fast: 4_000,
  fastFor: 120_000,
  slow: 15_000,
  /** The run ends here; the panel offers a button instead. */
  giveUpAfter: 1_200_000,
} as const

/** The wait before the next ask, `elapsed` ms into a run, or `null` when the run is over. */
export function nextPollDelay(elapsed: number): number | null {
  if (elapsed >= POLL.giveUpAfter) return null
  return elapsed < POLL.fastFor ? POLL.fast : POLL.slow
}

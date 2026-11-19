/**
 * The Lift figure's band in a 1440-wide frame: a low step (first) on columns
 * 1 to 4, an S curve across columns 5 and 6, a high step (latest) to the
 * right edge. A score maps between the baseline (the band resting on the
 * dashed line at the foot) and 100 (the band at the top of the frame).
 */
const WIDTH = 1440
const HEIGHT = 300
const BAND = 80
const STEP_START = 600
const STEP_END = 840

export type LiftStep = { top: number; center: number; bottom: number }

type Scores = { baseline: number; first: number; latest: number }

/** Where a score puts the band: resting on the baseline at `baseline`, at the top at 100. */
const liftStep = (score: number, baseline: number): LiftStep => {
  const half = BAND / 2
  const range = 100 - baseline
  const t = range > 0 ? Math.min(1, Math.max(0, (score - baseline) / range)) : 1
  const center = HEIGHT - half - t * (HEIGHT - BAND)
  return { top: center - half, center, bottom: center + half }
}

/** The band with its low step at `low` and its high step at `high`. */
const bandPath = (low: LiftStep, high: LiftStep) => {
  const mid = (STEP_START + STEP_END) / 2
  return [
    `M0 ${low.top}`,
    `H${STEP_START}`,
    `C${mid} ${low.top} ${mid} ${high.top} ${STEP_END} ${high.top}`,
    `H${WIDTH}`,
    `V${high.bottom}`,
    `H${STEP_END}`,
    `C${mid} ${high.bottom} ${mid} ${low.bottom} ${STEP_START} ${low.bottom}`,
    'H0Z',
  ].join(' ')
}

export const liftGeometry = (scores: Scores) => {
  const low = liftStep(scores.first, scores.baseline)
  const high = liftStep(scores.latest, scores.baseline)
  return { width: WIDTH, height: HEIGHT, first: low, latest: high, path: bandPath(low, high) }
}

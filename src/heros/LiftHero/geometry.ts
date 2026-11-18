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

export const liftGeometry = ({
  baseline,
  first,
  latest,
}: {
  baseline: number
  first: number
  latest: number
}) => {
  const half = BAND / 2
  const range = 100 - baseline
  const step = (score: number): LiftStep => {
    const t = range > 0 ? Math.min(1, Math.max(0, (score - baseline) / range)) : 1
    const center = HEIGHT - half - t * (HEIGHT - BAND)
    return { top: center - half, center, bottom: center + half }
  }
  const low = step(first)
  const high = step(latest)
  const mid = (STEP_START + STEP_END) / 2
  const path = [
    `M0 ${low.top}`,
    `H${STEP_START}`,
    `C${mid} ${low.top} ${mid} ${high.top} ${STEP_END} ${high.top}`,
    `H${WIDTH}`,
    `V${high.bottom}`,
    `H${STEP_END}`,
    `C${mid} ${high.bottom} ${mid} ${low.bottom} ${STEP_START} ${low.bottom}`,
    'H0Z',
  ].join(' ')
  return { width: WIDTH, height: HEIGHT, first: low, latest: high, path }
}

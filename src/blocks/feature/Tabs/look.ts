import type { PaintDials } from './PixelPaint'

/**
 * The tab swap's paint, settled on DialKit in the /proto/feature-tabs picker
 * (2026-11-20): small cells in loose clumps, nearly one after another, each
 * flipping straight to the new picture and refining through five halvings
 * with a faint spot wash on the coarse blocks.
 */
export const PIXEL_PAINT: PaintDials = {
  duration: 1500,
  ease: [0.22, 1, 0.36, 1],
  cell: 12,
  spread: 0.94,
  clump: 0.7,
  steps: 5,
  dissolve: 0.05,
  flash: 0.1,
}

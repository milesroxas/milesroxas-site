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

/**
 * The aim field's lock and click ripple, quieter than the CTA link's: this
 * block is read, not aimed at once. Lock corners take 6% of a box's short
 * side up to 28px (the CTA's 15% drew 60px brackets on the panel), and a
 * click sends two short rings that die within a few cells instead of four
 * rolling across the block.
 */
export const AIM_TUNING = {
  armRatio: 0.06,
  armMax: 28,
  rippleRings: 2,
  rippleSpeed: 360,
  rippleDecay: 0.6,
  rippleFalloff: 0.12,
} as const

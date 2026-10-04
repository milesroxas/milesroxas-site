import { describe, expect, it } from 'vitest'
import {
  foldStackDistance,
  packedShift,
  projectedHalfWidth,
  slideVisualState,
  stackCardFraction,
  stackVisualState,
} from './visual-state'

/** Width the pose shaves off one edge of a slide at `distance`, as a fraction of its width. */
const edgeLoss = (distance: number) => 0.5 - projectedHalfWidth(distance)

/**
 * A slide's visible edges in a frame where slides are one unit wide and sit
 * one unit apart (gutter folded out): centre at the signed distance, shifted
 * by the pack, spanning the projected half-width either side.
 */
const visibleEdges = (signed: number) => {
  const centre = signed + packedShift(signed)
  const halfWidth = projectedHalfWidth(Math.abs(signed))
  return { left: centre - halfWidth, right: centre + halfWidth }
}

describe('packedShift', () => {
  it('leaves the active slide where it is', () => {
    expect(packedShift(0)).toBeCloseTo(0)
    expect(slideVisualState(0).transform).toMatch(/^translateX\(0\.00%\) perspective/)
  })

  it('pulls each neighbour inward by what its pose shaved off the inner edge', () => {
    expect(packedShift(1)).toBeCloseTo(-edgeLoss(1))
    expect(packedShift(-1)).toBeCloseTo(edgeLoss(1))
    expect(slideVisualState(1).transform).toMatch(/^translateX\(-12\.79%\)/)
  })

  it('packs far slides against the neighbours between them and the active slide', () => {
    // The second slide out closes its own inner edge plus both edges of the
    // slide it sits behind.
    expect(packedShift(2)).toBeCloseTo(-(edgeLoss(2) + 2 * edgeLoss(1)))
    expect(packedShift(-2.5)).toBeCloseTo(edgeLoss(2.5) + 2 * edgeLoss(1.5) + 2 * edgeLoss(0.5))
  })

  it('keeps every adjacent pair one gutter apart at every scroll position', () => {
    for (const progress of [0, 0.15, 0.5, 0.85, 1]) {
      for (let index = -2; index <= 3; index += 1) {
        const near = visibleEdges(index - progress)
        const far = visibleEdges(index + 1 - progress)
        expect(far.left - near.right, `progress ${progress}, slide ${index}`).toBeCloseTo(0, 9)
      }
    }
  })

  it('is continuous where the running sum picks up a slide', () => {
    for (const boundary of [1, 2]) {
      expect(packedShift(boundary - 1e-9)).toBeCloseTo(packedShift(boundary + 1e-9), 6)
    }
  })
})

describe('stack pose', () => {
  it('pins every pile board into the slot, left edges on the grid line', () => {
    expect(stackVisualState(0).transform).toBe('translateX(0.00%) scale(1.0000)')
    // One snap out sits one slide (1 / card fraction cards) right; the pin
    // cancels it, then the scale loss and one peek push its right edge out.
    const shift = (-1 / stackCardFraction() + 0.06 + 0.055) * 100
    expect(stackVisualState(1).transform).toBe(`translateX(${shift.toFixed(2)}%) scale(0.9400)`)
  })

  it('ends the back board on the slot edge, so the pile fills its column', () => {
    // Right edge in slide widths: the shifted-back scale loss plus the scaled card.
    const rightEdge = (signed: number, count: number) => {
      const { transform } = stackVisualState(signed, count)
      const [, shift, scale] = /translateX\((-?[\d.]+)%\) scale\(([\d.]+)\)/.exec(transform) ?? []
      return (
        (Number(shift) / 100 + signed / stackCardFraction(count) + Number(scale)) *
        stackCardFraction(count)
      )
    }
    expect(rightEdge(2, 5)).toBeCloseTo(1, 3)
    expect(rightEdge(1, 3)).toBeCloseTo(1, 3)
    expect(rightEdge(1, 2)).toBeCloseTo(1, 3)
  })

  it('paints the pile front to back and the leaving board over all of it', () => {
    const z = (signed: number) => stackVisualState(signed).zIndex ?? 0
    expect(z(-0.5)).toBeGreaterThan(z(0))
    expect(z(0)).toBeGreaterThan(z(1))
    expect(z(1)).toBeGreaterThan(z(2))
    expect(z(-1)).toBeLessThan(z(2))
  })

  it('fades the leaving board out early, defocusing as it goes', () => {
    expect(stackVisualState(-0.1).opacity).toBeGreaterThan(0.6)
    expect(stackVisualState(-0.5).opacity).toBeLessThan(0.1)
    expect(stackVisualState(-0.65).opacity).toBe(0)
    expect(stackVisualState(-0.65).filter).toBe('blur(8.00px)')
  })

  it('recedes the pile into the band rather than darkening it', () => {
    expect(stackVisualState(0)).toMatchObject({ filter: 'none', veil: 0 })
    expect(stackVisualState(2, 5).veil).toBeCloseTo(0.44)
  })

  it('keeps boards past the cap squared up under the last one, opaque', () => {
    // Where the board lands relative to the slot, the pin added back out.
    const landing = (signed: number, count: number) => {
      const { transform } = stackVisualState(signed, count)
      const shift = Number(/translateX\((-?[\d.]+)%\)/.exec(transform)?.[1])
      return `${(shift + (signed / stackCardFraction(count)) * 100).toFixed(1)} ${transform.split(' ')[1]}`
    }
    expect(landing(2.5, 5)).toBe(landing(2, 5))
    expect(stackVisualState(2.5, 5).opacity).toBe(1)
    expect(stackVisualState(3.5, 5).opacity).toBe(0)
    // Three slides show one board behind, so the one that wraps lands hidden.
    expect(landing(2, 3)).toBe(landing(1, 3))
  })
})

describe('stack pose across the loop seam', () => {
  it('pins a board from where it really is, but poses it by its place in the pile', () => {
    // Two slides left of the slot in a deck of four is the back of the pile:
    // pinned two slides right, then posed at depth two.
    const shift = (2 / stackCardFraction(4) + 0.12 + 0.11) * 100
    expect(stackVisualState(-2, 4)).toMatchObject({
      transform: `translateX(${shift.toFixed(2)}%) scale(0.8800)`,
      zIndex: 80,
    })
  })
})

describe('foldStackDistance', () => {
  it('keeps one board leaving and every other one in the pile', () => {
    expect(foldStackDistance(-0.5, 4)).toBeCloseTo(-0.5)
    expect(foldStackDistance(-1, 4)).toBe(3)
    expect(foldStackDistance(-2, 4)).toBe(2)
    expect(foldStackDistance(3, 4)).toBe(3)
    expect(foldStackDistance(1, 2)).toBe(1)
  })
})

import { describe, expect, it } from 'vitest'
import {
  bevelHeight,
  dispersionRatios,
  displacementMap,
  GLASS_CONTROL,
  highlightMap,
  refract,
  roundedBoxDistance,
} from './optics'

const SHAPE = { width: 120, height: 40, radius: 12 }

/** The offset a displacement map pixel encodes, in px of the green channel. */
const offsetAt = (map: ReturnType<typeof displacementMap>, column: number, row: number) => {
  const index = (row * map.columns + column) * 4
  const scale = map.scales[1]
  return [(map.data[index] / 255 - 0.5) * scale, (map.data[index + 1] / 255 - 0.5) * scale]
}

describe('liquid glass optics', () => {
  it('measures the rounded box: negative inside, zero on the edge, positive outside', () => {
    expect(roundedBoxDistance(0, 0, 60, 20, 12)).toBe(-20)
    expect(roundedBoxDistance(60, 0, 60, 20, 12)).toBeCloseTo(0)
    expect(roundedBoxDistance(70, 0, 60, 20, 12)).toBeCloseTo(10)
    // The corner is rounded: the box's own corner point lies outside it.
    expect(roundedBoxDistance(60, 20, 60, 20, 12)).toBeGreaterThan(0)
  })

  it('raises the bevel from nothing at the edge to full thickness past its width', () => {
    expect(bevelHeight(0, GLASS_CONTROL)).toBe(0)
    expect(bevelHeight(-GLASS_CONTROL.bevelWidth, GLASS_CONTROL)).toBe(GLASS_CONTROL.thickness)
    expect(bevelHeight(-GLASS_CONTROL.bevelWidth / 2, GLASS_CONTROL)).toBeGreaterThan(0)
  })

  it('refracts like GLSL: straight through head-on, nothing past total internal reflection', () => {
    expect(refract([0, 0, -1], [0, 0, 1], 1 / 1.5)).toEqual([0, 0, -1])
    expect(refract([1, 0, 0], [0, 0, 1], 1.5)).toEqual([0, 0, 0])
  })

  it('leaves the flat middle of the glass unrefracted', () => {
    const map = displacementMap(SHAPE, GLASS_CONTROL)
    const [x, y] = offsetAt(map, 60, 20)
    // Within one 8-bit step: 128 is the nearest byte to the neutral 127.5.
    const step = map.scales[1] / 255
    expect(Math.abs(x)).toBeLessThan(step)
    expect(Math.abs(y)).toBeLessThan(step)
  })

  it('bends the edge inward, the same amount on opposite sides', () => {
    const map = displacementMap(SHAPE, GLASS_CONTROL)
    const [left] = offsetAt(map, 2, 20)
    const [right] = offsetAt(map, SHAPE.width - 3, 20)
    const [, top] = offsetAt(map, 60, 2)
    expect(left).toBeGreaterThan(1)
    expect(right).toBeLessThan(-1)
    expect(left).toBeCloseTo(-right, 0)
    expect(top).toBeGreaterThan(1)
  })

  it('spreads red least and blue most', () => {
    const [red, green, blue] = dispersionRatios(GLASS_CONTROL)
    expect(red).toBeLessThan(green)
    expect(blue).toBeGreaterThan(green)
    const { scales } = displacementMap(SHAPE, GLASS_CONTROL)
    expect(scales[0]).toBeLessThan(scales[1])
    expect(scales[2]).toBeGreaterThan(scales[1])
  })

  it('lights only the edge, brighter at the top than the bottom', () => {
    const map = highlightMap(SHAPE, GLASS_CONTROL, 1)
    const alpha = (column: number, row: number) => map.data[(row * map.columns + column) * 4 + 3]
    expect(alpha(60, 20)).toBe(0)
    expect(alpha(60, 0)).toBeGreaterThan(alpha(60, SHAPE.height - 1))
    // Outside the rounded corner there is no glass to light.
    expect(alpha(0, 0)).toBe(0)
  })
})

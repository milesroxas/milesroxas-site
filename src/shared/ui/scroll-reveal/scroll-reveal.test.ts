import { describe, expect, it } from 'vitest'
import { cascadeStagger, revealEasing, revealGateMargin } from './scroll-reveal'

describe('cascadeStagger', () => {
  it('keeps the tuned stagger for a short burst', () => {
    expect(cascadeStagger(0.12, 2)).toBe(0.12)
    expect(cascadeStagger(0.12, 7)).toBe(0.12)
  })

  it('compresses a long burst so its last beat starts within the cascade cap', () => {
    expect(cascadeStagger(0.12, 21)).toBeCloseTo(0.04)
  })

  it('leaves a single beat alone', () => {
    expect(cascadeStagger(0.04, 1)).toBe(0.04)
    expect(cascadeStagger(0.04, 0)).toBe(0.04)
  })
})

describe('revealGateMargin', () => {
  it('reaches far above the viewport and stops the offset above the fold', () => {
    expect(revealGateMargin(0.25)).toBe('100000px 0px -25% 0px')
  })

  it('never collapses the root to a line', () => {
    expect(revealGateMargin(1)).toBe('100000px 0px -90% 0px')
    expect(revealGateMargin(-1)).toBe('100000px 0px -0% 0px')
  })
})

describe('revealEasing', () => {
  const stops = (easing: string) =>
    easing
      .slice('linear('.length, -1)
      .split(', ')
      .map((stop) => Number(stop))

  it('samples a GSAP ease into a linear() curve from 0 to 1', () => {
    const curve = stops(revealEasing('power3.out'))
    expect(curve).toHaveLength(25)
    expect(curve[0]).toBe(0)
    expect(curve.at(-1)).toBe(1)
    for (let i = 1; i < curve.length; i++) expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1])
  })

  it('keeps the ease-out shape: most of the travel in the first third', () => {
    const curve = stops(revealEasing('power3.out'))
    expect(curve[8]).toBeGreaterThan(0.75)
  })
})

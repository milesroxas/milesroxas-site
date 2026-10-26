import { describe, expect, it } from 'vitest'
import { cascadeStagger, nextBeatAt, revealGateMargin } from './scroll-reveal'

describe('cascadeStagger', () => {
  it('keeps the tuned stagger for a short burst', () => {
    expect(cascadeStagger(0.06, 2)).toBe(0.06)
    expect(cascadeStagger(0.06, 7)).toBe(0.06)
  })

  it('compresses a long burst so its last beat starts within the cascade cap', () => {
    expect(cascadeStagger(0.06, 21)).toBeCloseTo(0.02)
  })

  it('leaves a single beat alone', () => {
    expect(cascadeStagger(0.04, 1)).toBe(0.04)
    expect(cascadeStagger(0.04, 0)).toBe(0.04)
  })
})

describe('nextBeatAt', () => {
  it('cascades a stagger after the last beat on the track', () => {
    expect(nextBeatAt(10, 10.2, 0.12)).toBeCloseTo(10.32)
  })

  it('starts at once when the track has been idle', () => {
    expect(nextBeatAt(10, 3, 0.12)).toBe(10)
  })

  it('never queues a beat more than the cascade cap past its gate', () => {
    expect(nextBeatAt(10, 12.5, 0.06)).toBeCloseTo(10.4)
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

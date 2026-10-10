import { describe, expect, it } from 'vitest'
import {
  computeTweenFactor,
  forEachSnapDistance,
  loopAwareDiff,
  openingSnap,
  type SnapEngine,
} from './geometry'

/** 4 half-size slides: snaps every 1/3 of progress space, one slide per snap. */
const engineOf = (overrides?: Partial<SnapEngine>): SnapEngine => ({
  options: { loop: true },
  slideRegistry: [[0], [1], [2], [3]],
  slideLooper: { loopPoints: [] },
  ...overrides,
})

const snaps = [0, 1 / 3, 2 / 3, 1]

describe('computeTweenFactor', () => {
  it('converts progress-space snap spacing into whole snap units', () => {
    expect(computeTweenFactor(snaps)).toBeCloseTo(3)
  })

  it('falls back to 1 for a single snap or zero spacing', () => {
    expect(computeTweenFactor([0])).toBe(1)
    expect(computeTweenFactor([])).toBe(1)
    expect(computeTweenFactor([0.5, 0.5])).toBe(1)
  })
})

describe('openingSnap', () => {
  it('opens a looping deck on its first slide', () => {
    expect(openingSnap(true, 3)).toBe(0)
    expect(openingSnap(true, 8)).toBe(0)
  })

  it('opens an unlooped deck on its middle slide, the earlier one of an even count', () => {
    expect(openingSnap(false, 3)).toBe(1)
    expect(openingSnap(false, 5)).toBe(2)
    expect(openingSnap(false, 4)).toBe(1)
    expect(openingSnap(false, 2)).toBe(0)
    expect(openingSnap(false, 1)).toBe(0)
    expect(openingSnap(false, 0)).toBe(0)
  })
})

describe('loopAwareDiff', () => {
  it('measures a plain slide against the raw progress', () => {
    expect(loopAwareDiff(engineOf(), 1, snaps[1], 0)).toBeCloseTo(1 / 3)
  })

  it('wraps a slide the looper shifted backward (target sign -1)', () => {
    const engine = engineOf({
      slideLooper: { loopPoints: [{ index: 3, target: () => -1 }] },
    })
    // Slide 3 renders before slide 0: at progress 0 it sits one snap behind.
    expect(loopAwareDiff(engine, 3, snaps[3], 0)).toBeCloseTo(0)
    expect(loopAwareDiff(engine, 3, snaps[3], 1 / 3)).toBeCloseTo(-1 / 3)
  })

  it('wraps a slide the looper shifted forward (target sign 1)', () => {
    const engine = engineOf({
      slideLooper: { loopPoints: [{ index: 0, target: () => 1 }] },
    })
    // Slide 0 renders after slide 3: at progress 1 it sits one snap ahead.
    expect(loopAwareDiff(engine, 0, snaps[0], 1)).toBeCloseTo(0)
    expect(loopAwareDiff(engine, 0, snaps[0], 2 / 3)).toBeCloseTo(1 / 3)
  })

  it('ignores loop points when the loop is off or the shift is zero', () => {
    const parked = engineOf({
      slideLooper: { loopPoints: [{ index: 1, target: () => 0 }] },
    })
    expect(loopAwareDiff(parked, 1, snaps[1], 0)).toBeCloseTo(1 / 3)

    const unlooped = engineOf({
      options: { loop: false },
      slideLooper: { loopPoints: [{ index: 1, target: () => -1 }] },
    })
    expect(loopAwareDiff(unlooped, 1, snaps[1], 0)).toBeCloseTo(1 / 3)
  })
})

describe('forEachSnapDistance', () => {
  it('visits every slide with its signed distance in whole snaps', () => {
    const engine = engineOf({
      slideLooper: { loopPoints: [{ index: 3, target: () => -1 }] },
    })
    const factor = computeTweenFactor(snaps)
    const seen = new Map<number, number>()
    forEachSnapDistance(engine, snaps, 0, factor, (slideIndex, signed) => {
      seen.set(slideIndex, signed)
    })

    expect(seen.get(0)).toBeCloseTo(0) // active
    expect(seen.get(1)).toBeCloseTo(1) // one snap ahead
    expect(seen.get(2)).toBeCloseTo(2)
    expect(seen.get(3)).toBeCloseTo(0) // looped in front of the seam
  })

  it('visits every slide registered to a snap', () => {
    const engine = engineOf({
      slideRegistry: [
        [0, 1],
        [2, 3],
      ],
    })
    const visited: number[] = []
    forEachSnapDistance(engine, [0, 0.5], 0, 2, (slideIndex) => {
      visited.push(slideIndex)
    })
    expect(visited).toEqual([0, 1, 2, 3])
  })
})

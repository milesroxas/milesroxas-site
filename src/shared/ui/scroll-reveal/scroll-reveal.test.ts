import { describe, expect, it } from 'vitest'
import { cascadeStagger } from './scroll-reveal'

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

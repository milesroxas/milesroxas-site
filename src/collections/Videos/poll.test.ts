import { describe, expect, it } from 'vitest'
import { nextPollDelay, POLL } from './poll'

describe('nextPollDelay', () => {
  it('asks quickly at first, slower after two minutes, and stops after twenty', () => {
    expect(nextPollDelay(0)).toBe(POLL.fast)
    expect(nextPollDelay(POLL.fastFor - 1)).toBe(POLL.fast)
    expect(nextPollDelay(POLL.fastFor)).toBe(POLL.slow)
    expect(nextPollDelay(POLL.giveUpAfter - 1)).toBe(POLL.slow)
    expect(nextPollDelay(POLL.giveUpAfter)).toBeNull()
  })

  it('bounds a forgotten tab to a few hundred asks', () => {
    let elapsed = 0
    let asks = 0
    for (let delay = nextPollDelay(elapsed); delay !== null; delay = nextPollDelay(elapsed)) {
      elapsed += delay
      asks += 1
    }
    expect(asks).toBeLessThan(120)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cloudflareFetch, isTransientStatus } from './cloudflare'

const response = (status: number) => new Response(null, { status })

afterEach(() => vi.unstubAllGlobals())

describe('isTransientStatus', () => {
  it('retries rate limits and server errors only', () => {
    expect(isTransientStatus(429)).toBe(true)
    expect(isTransientStatus(503)).toBe(true)
    expect(isTransientStatus(400)).toBe(false)
    expect(isTransientStatus(200)).toBe(false)
  })
})

describe('cloudflareFetch', () => {
  it('returns the first final answer', async () => {
    const fetch = vi.fn(async () => response(400))
    vi.stubGlobal('fetch', fetch)
    expect((await cloudflareFetch('u', () => ({}), 3)).status).toBe(400)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries a transient answer and rebuilds the request each time', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(200))
    vi.stubGlobal('fetch', fetch)
    const init = vi.fn(() => ({ method: 'POST' }))
    expect((await cloudflareFetch('u', init, 3)).status).toBe(200)
    expect(init).toHaveBeenCalledTimes(2)
  })

  it('gives up after the last attempt, with the last answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response(500)),
    )
    expect((await cloudflareFetch('u', () => ({}), 2)).status).toBe(500)
  })

  it('throws the network error once attempts are spent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    await expect(cloudflareFetch('u', () => ({}), 2)).rejects.toThrow('offline')
  })
})

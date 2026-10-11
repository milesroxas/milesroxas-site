import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaFixture } from '@/stories/fixtures'
import { ImageMedia } from './index'

// A Cloudflare Images URL takes the project's own loader, so next/image needs no host allow-list.
const cloudflareImage = {
  ...mediaFixture,
  cloudflareImageUrl: 'https://imagedelivery.net/hash/image-id/public',
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ImageMedia', () => {
  it('asks again after a failed request, twice at most', () => {
    const { container } = render(<ImageMedia resource={cloudflareImage} />)
    const img = () => container.querySelector('img') as HTMLImageElement

    const first = img()
    fireEvent.error(first)
    expect(img()).toBe(first)
    act(() => vi.advanceTimersByTime(1500))
    const second = img()
    expect(second).not.toBe(first)
    expect(second.getAttribute('src')).toBe(first.getAttribute('src'))

    fireEvent.error(second)
    act(() => vi.advanceTimersByTime(1500))
    const third = img()
    expect(third).not.toBe(second)

    fireEvent.error(third)
    act(() => vi.advanceTimersByTime(5000))
    expect(img()).toBe(third)
  })
})

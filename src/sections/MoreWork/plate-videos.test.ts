import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { warmVideo } from '@/components/Media/VideoMedia'
import { MORE_WORK_MOTION } from './motion'
import { createPlateVideos, neighboursOf } from './plate-videos'

vi.mock('@/components/Media/VideoMedia', () => ({ warmVideo: vi.fn() }))

/** jsdom has no media pipeline: playing is a set the mocks keep. */
const playing = new Set<HTMLMediaElement>()

/** Layer 0 is an image; layers 1 to 3 carry a video. */
const buildFrame = () => {
  const frame = document.createElement('div')
  for (let row = 0; row < 4; row++) {
    const layer = document.createElement('div')
    layer.setAttribute('data-plate-layer', String(row))
    if (row > 0) layer.append(document.createElement('video'))
    frame.append(layer)
  }
  document.body.append(frame)
  const videoOf = (row: number) =>
    frame.querySelector(`[data-plate-layer="${row}"] video`) as HTMLVideoElement
  const canPaint = (row: number) =>
    Object.defineProperty(videoOf(row), 'readyState', { value: HTMLMediaElement.HAVE_FUTURE_DATA })
  return { frame, videoOf, canPaint }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(warmVideo).mockClear()
  playing.clear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value(this: HTMLMediaElement) {
      playing.add(this)
      return Promise.resolve()
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value(this: HTMLMediaElement) {
      playing.delete(this)
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get(this: HTMLMediaElement) {
      return !playing.has(this)
    },
  })
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('neighboursOf', () => {
  it('names the rows either side, without looping', () => {
    expect(neighboursOf(0, 4)).toEqual([1])
    expect(neighboursOf(2, 4)).toEqual([1, 3])
    expect(neighboursOf(3, 4)).toEqual([2])
    expect(neighboursOf(0, 1)).toEqual([])
  })
})

describe('createPlateVideos', () => {
  it('plays the shown row and warms its neighbours once it can paint', () => {
    const { frame, videoOf, canPaint } = buildFrame()
    canPaint(2)
    const videos = createPlateVideos(frame, 4)
    videos.show(2)
    expect(videoOf(2).paused).toBe(false)
    expect(videoOf(1).paused).toBe(true)
    expect(videoOf(3).paused).toBe(true)
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([
      videoOf(1),
      videoOf(3),
    ])
  })

  it('waits for frames before warming the neighbours', () => {
    const { frame, videoOf } = buildFrame()
    const videos = createPlateVideos(frame, 4)
    videos.show(2)
    expect(warmVideo).not.toHaveBeenCalled()
    videoOf(2).dispatchEvent(new Event('canplay'))
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([
      videoOf(1),
      videoOf(3),
    ])
  })

  it('warms at once beside an image row', () => {
    const { frame, videoOf } = buildFrame()
    const videos = createPlateVideos(frame, 4)
    videos.show(0)
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([videoOf(1)])
    expect(playing.size).toBe(0)
  })

  it('keeps the row shown before playing until the wave has landed', () => {
    const { frame, videoOf, canPaint } = buildFrame()
    canPaint(1)
    canPaint(2)
    const videos = createPlateVideos(frame, 4)
    videos.show(1)
    videos.show(2)
    expect(videoOf(1).paused).toBe(false)
    expect(videoOf(2).paused).toBe(false)
    vi.advanceTimersByTime(MORE_WORK_MOTION.plate.duration)
    expect(videoOf(1).paused).toBe(true)
    expect(videoOf(2).paused).toBe(false)
  })

  it('a row shown again before the wave lands never pauses', () => {
    const { frame, videoOf, canPaint } = buildFrame()
    canPaint(1)
    canPaint(2)
    const videos = createPlateVideos(frame, 4)
    videos.show(1)
    videos.show(2)
    vi.advanceTimersByTime(MORE_WORK_MOTION.plate.duration / 2)
    videos.show(1)
    vi.advanceTimersByTime(MORE_WORK_MOTION.plate.duration)
    expect(videoOf(1).paused).toBe(false)
    expect(videoOf(2).paused).toBe(true)
  })

  it('dispose drops the pending pause and the frame wait', () => {
    const { frame, videoOf, canPaint } = buildFrame()
    canPaint(1)
    const videos = createPlateVideos(frame, 4)
    videos.show(1)
    videos.show(2)
    videos.dispose()
    vi.advanceTimersByTime(MORE_WORK_MOTION.plate.duration)
    videoOf(2).dispatchEvent(new Event('canplay'))
    expect(videoOf(1).paused).toBe(false)
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([videoOf(2)])
  })
})

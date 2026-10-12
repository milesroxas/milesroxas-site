import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { warmVideo } from '@/components/Media/VideoMedia'
import type { CarouselApi } from '@/components/ui/carousel'
import { collectSlideRefs, createPlaybackController, neighboursOf } from './playback'

// Reduced motion keeps every poster on a plain fade; the mock lands it at once.
vi.mock('gsap', () => ({
  gsap: {
    killTweensOf: vi.fn(),
    timeline: vi.fn(),
    to: vi.fn((_target: unknown, vars: { onComplete?: () => void }) => vars.onComplete?.()),
  },
}))

vi.mock('@/components/Media/VideoMedia', () => ({ warmVideo: vi.fn() }))

const play = vi.fn(() => Promise.resolve())

/** Slide 0 is an image; slides 1 to 3 carry a video under a poster overlay. */
const buildDeck = () =>
  Array.from({ length: 4 }, (_, index) => {
    const slide = document.createElement('div')
    const target = document.createElement('div')
    slide.append(target)
    if (index === 0) return slide
    const frame = document.createElement('div')
    const video = document.createElement('video')
    video.poster = `https://example.com/${index}.jpg`
    const poster = document.createElement('div')
    poster.setAttribute('data-carousel-poster', '')
    frame.append(video, poster)
    target.append(frame)
    return slide
  })

const setup = ({ inView = true, selected = 0 } = {}) => {
  const refs = buildDeck().map(collectSlideRefs)
  const state = { selected }
  const api = { selectedScrollSnap: () => state.selected } as unknown as NonNullable<CarouselApi>
  const controller = createPlaybackController({
    api,
    contextSafe: (fn) => fn,
    dissolveId: 'dissolve',
    dissolveMap: { current: null },
    getSlideRefs: () => refs,
    inView: () => inView,
    reducedMotion: true,
  })
  const videoOf = (index: number) => refs[index]?.video as HTMLVideoElement
  return { controller, state, videoOf }
}

beforeEach(() => {
  vi.mocked(warmVideo).mockClear()
  play.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play })
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('neighboursOf', () => {
  it('names the snaps either side, looping', () => {
    expect(neighboursOf(0, 4)).toEqual([3, 1])
    expect(neighboursOf(2, 4)).toEqual([1, 3])
    expect(neighboursOf(1, 2)).toEqual([0])
    expect(neighboursOf(0, 1)).toEqual([])
  })
})

describe('createPlaybackController', () => {
  it('an active image slide warms both neighbours at once, and plays nothing', () => {
    const { controller, videoOf } = setup()
    controller.syncVideos()
    expect(play).not.toHaveBeenCalled()
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([
      videoOf(3),
      videoOf(1),
    ])
  })

  it('an active video plays first; its neighbours warm once it can play', () => {
    const { controller, state, videoOf } = setup({ selected: 1 })
    controller.syncVideos()
    expect(play).toHaveBeenCalledTimes(1)
    expect(warmVideo).not.toHaveBeenCalled()

    videoOf(1).dispatchEvent(new Event('canplay'))
    // Slide 0 is an image, so only slide 2 is left to warm.
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([videoOf(2)])

    // Moving on warms the next pair, never the same video twice.
    state.selected = 2
    Object.defineProperty(videoOf(2), 'readyState', { value: HTMLMediaElement.HAVE_CURRENT_DATA })
    controller.syncVideos()
    expect(vi.mocked(warmVideo).mock.calls.map(([video]) => video)).toEqual([
      videoOf(2),
      videoOf(1),
      videoOf(3),
    ])
  })

  it('warms nothing while the deck is out of view', () => {
    const { controller } = setup({ inView: false })
    controller.syncVideos()
    expect(warmVideo).not.toHaveBeenCalled()
  })
})

import { warmVideo } from '@/components/Media/VideoMedia'
import { MORE_WORK_MOTION } from './motion'

/** The rows either side of `index`; the plate's indexes do not loop. */
export const neighboursOf = (index: number, count: number): number[] =>
  [index - 1, index + 1].filter((row) => row >= 0 && row < count)

export type PlateVideos = {
  /** Row `index` is the one shown: its video plays, the rest wind down. */
  show: (index: number) => void
  dispose: () => void
}

/**
 * Drives the videos in the plate's layers the way the carousel drives its
 * slides (`blocks/Carousel/playback`): the shown row's video plays, the rows
 * either side warm (`warmVideo`) once it can paint, so the next wave arrives
 * with frames, and the rest stay paused with nothing fetched. The row shown
 * before keeps playing while the wave carries the next picture over it, and
 * pauses once the wave has landed.
 */
export function createPlateVideos(frame: HTMLElement, count: number): PlateVideos {
  let pauseTimer: ReturnType<typeof setTimeout> | undefined
  let awaited: HTMLVideoElement | null = null
  let onCanPlay: (() => void) | null = null

  const videoAt = (row: number) =>
    frame.querySelector<HTMLVideoElement>(`[data-plate-layer="${row}"] video`)

  const forget = () => {
    if (awaited && onCanPlay) awaited.removeEventListener('canplay', onCanPlay)
    awaited = null
    onCanPlay = null
  }

  const pauseOthers = (index: number) => {
    for (let row = 0; row < count; row++) {
      const video = row === index ? null : videoAt(row)
      if (video && !video.paused) video.pause()
    }
  }

  const show = (index: number) => {
    clearTimeout(pauseTimer)
    forget()
    pauseTimer = setTimeout(() => pauseOthers(index), MORE_WORK_MOTION.plate.duration)
    const warmNeighbours = () => {
      for (const row of neighboursOf(index, count)) {
        const video = videoAt(row)
        if (video) warmVideo(video)
      }
    }
    const shown = videoAt(index)
    // An image has nothing to wait for.
    if (!shown) return warmNeighbours()
    if (shown.paused) shown.play().catch(() => {})
    if (shown.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return warmNeighbours()
    awaited = shown
    onCanPlay = () => {
      forget()
      warmNeighbours()
    }
    shown.addEventListener('canplay', onCanPlay, { once: true })
  }

  const dispose = () => {
    clearTimeout(pauseTimer)
    forget()
  }

  return { show, dispose }
}

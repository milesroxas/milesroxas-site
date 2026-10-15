import type { Decorator, GlobalTypes } from '@storybook/nextjs-vite'
import gsap from 'gsap'
import { useEffect } from 'react'

/**
 * Slow motion for studying choreography. Every running animation (CSS,
 * transitions, WAAPI) gets the chosen playback rate each frame, GSAP's
 * global timeline (the panel swaps) runs at it, and `setTimeout` delays
 * stretch by the same factor, so timer-driven beats (the contact seal's
 * exit) stay in step with the animations around them.
 */
export const motionSpeedGlobalTypes = {
  motionSpeed: {
    description: 'Animation speed',
    toolbar: {
      title: 'Speed',
      icon: 'timer',
      items: [
        { value: '1', title: '1× speed' },
        { value: '0.5', title: '0.5× speed' },
        { value: '0.25', title: '0.25× speed' },
        { value: '0.1', title: '0.1× speed' },
      ],
      dynamicTitle: true,
    },
  },
} satisfies GlobalTypes

const nativeSetTimeout = window.setTimeout.bind(window)

export const withMotionSpeed: Decorator = (Story, { globals }) => {
  const rate = Number(globals.motionSpeed ?? 1)

  useEffect(() => {
    if (rate === 1) return
    gsap.globalTimeline.timeScale(rate)
    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, (delay ?? 0) / rate, ...args)) as typeof window.setTimeout
    let frame = requestAnimationFrame(function slow() {
      for (const animation of document.getAnimations()) {
        if (animation.playbackRate !== rate) animation.playbackRate = rate
      }
      frame = requestAnimationFrame(slow)
    })
    return () => {
      cancelAnimationFrame(frame)
      gsap.globalTimeline.timeScale(1)
      window.setTimeout = nativeSetTimeout as typeof window.setTimeout
      for (const animation of document.getAnimations()) animation.playbackRate = 1
    }
  }, [rate])

  return <Story />
}

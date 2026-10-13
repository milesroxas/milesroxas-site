'use client'

import gsap from 'gsap'
import { type LenisRef, ReactLenis } from 'lenis/react'
import type React from 'react'
import { useEffect, useRef } from 'react'
import 'lenis/dist/lenis.css'

/**
 * A frame longer than this is a stall, not scrolling: the ticker then
 * advances every clock by `LAG_ADJUST_MS` instead of the real gap, so Lenis
 * eases on from where it was rather than leaping to catch up.
 */
const LAG_THRESHOLD_MS = 100
const LAG_ADJUST_MS = 33

/**
 * The most Lenis's clock advances in one frame (ms): two 60Hz frames. Its
 * lerp is time-based, so a 75ms frame (a paragraph split into lines, an image
 * decode) moved the page by the whole gap at once, four times the frame
 * before it. GSAP's lag smoothing only catches gaps past `LAG_THRESHOLD_MS`;
 * this catches the common, shorter stall, and a scroll eases on from where it
 * was.
 */
const MAX_STEP_MS = 34

type LenisProviderProps = {
  children: React.ReactNode
}

/**
 * Smooth scrolling for the whole document, stepped from GSAP's ticker so the
 * scroll position and every tween advance in one frame loop with one clock.
 * Lenis's own loop would catch up after a long frame by jumping: its lerp is
 * time-based, and a 150ms stall moved the page a quarter screen in one frame.
 * Lenis's stylesheet keeps nested scrollers (`data-lenis-prevent`) from
 * chaining into the page and iframes from swallowing the wheel mid-scroll.
 */
export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const ref = useRef<LenisRef>(null)

  useEffect(() => {
    let clock = 0
    const step = (_time: number, deltaTime: number) => {
      clock += Math.min(deltaTime, MAX_STEP_MS)
      ref.current?.lenis?.raf(clock)
    }
    gsap.ticker.add(step)
    gsap.ticker.lagSmoothing(LAG_THRESHOLD_MS, LAG_ADJUST_MS)
    return () => {
      gsap.ticker.remove(step)
    }
  }, [])

  return (
    <ReactLenis options={{ autoRaf: false }} ref={ref} root>
      {children}
    </ReactLenis>
  )
}

'use client'

import gsap from 'gsap'
import { type LenisRef, ReactLenis } from 'lenis/react'
import type React from 'react'
import { useEffect, useRef } from 'react'

/**
 * A frame longer than this is a stall, not scrolling: the ticker then
 * advances every clock by `LAG_ADJUST_MS` instead of the real gap, so Lenis
 * eases on from where it was rather than leaping to catch up.
 */
const LAG_THRESHOLD_MS = 100
const LAG_ADJUST_MS = 33

type LenisProviderProps = {
  children: React.ReactNode
}

/**
 * Smooth scrolling for the whole document, stepped from GSAP's ticker so the
 * scroll position and every tween advance in one frame loop with one clock.
 * Lenis's own loop would catch up after a long frame by jumping: its lerp is
 * time-based, and a 150ms stall moved the page a quarter screen in one frame.
 */
export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const ref = useRef<LenisRef>(null)

  useEffect(() => {
    const step = (time: number) => ref.current?.lenis?.raf(time * 1000)
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

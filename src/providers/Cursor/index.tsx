'use client'

import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import styles from './cursor.module.css'
import { CURSOR_LABELS, type CursorVariant, isCursorVariant } from './variants'
import { cursorZones } from './zones'

const VARIANTS = Object.keys(CURSOR_LABELS) as CursorVariant[]
// Long enough to cross the gutter between two cards without the ring closing.
const LEAVE_GRACE_MS = 150

function variantAt(target: EventTarget | null): CursorVariant | null {
  if (!(target instanceof Element)) return null
  const value = target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor
  return value && isCursorVariant(value) ? value : null
}

/** Resolved after mount, so server and client render the same (nothing) first. */
function useFinePointer() {
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  return finePointer
}

/** A dot on the pointer and a trailing ring that swaps the dot for a label over any `cursorTarget`. */
export function Cursor() {
  const finePointer = useFinePointer()
  const rootRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const ring = ringRef.current
    const dot = dotRef.current
    if (!finePointer || !root || !ring || !dot) return

    const labels = Array.from(ring.querySelectorAll<HTMLElement>('[data-variant]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const follow: gsap.TweenVars = { duration: reduceMotion ? 0 : 0.2, ease: 'power3.out' }
    const ringX = gsap.quickTo(ring, 'x', follow)
    const ringY = gsap.quickTo(ring, 'y', follow)
    let current: CursorVariant | null = null
    let leaveTimer: number | undefined
    let placed = false
    let pressed = false
    const zones = cursorZones([ring, dot])
    let x = 0
    let y = 0

    const apply = (variant: CursorVariant | null) => {
      current = variant
      const active = labels.find((label) => label.dataset.variant === variant)
      for (const label of labels) label.toggleAttribute('data-active', label === active)
      root.toggleAttribute('data-labelled', Boolean(active))
    }

    // Opening is immediate; closing waits out the grace period, so hopping
    // card to card keeps the ring open and only a new label crossfades.
    const show = (variant: CursorVariant | null) => {
      // A held press keeps its label: a drag that runs off the deck still says Drag.
      if (pressed && current) return
      if (variant) {
        window.clearTimeout(leaveTimer)
        leaveTimer = undefined
        if (variant !== current) apply(variant)
      } else if (current && leaveTimer === undefined) {
        leaveTimer = window.setTimeout(() => {
          leaveTimer = undefined
          apply(null)
        }, LEAVE_GRACE_MS)
      }
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      // First sighting lands on the pointer instead of trailing in from the corner.
      if (!placed) {
        placed = true
        gsap.set(ring, { x, y })
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ringX(x)
      ringY(y)
      zones.wake()
      // A band running the aim field draws its own reticle there.
      if (e.target instanceof Element && e.target.closest('[data-aim-host]')) {
        delete root.dataset.visible
        return
      }
      root.dataset.visible = ''
      show(variantAt(e.target))
    }
    // The target can change under a still pointer: content scrolls, or a
    // click swaps it out (a video's loop for its player). Re-read after the
    // click's commit so the label leaves with the thing it named.
    const recheck = () => show(variantAt(document.elementFromPoint(x, y)))
    const onClick = () => requestAnimationFrame(recheck)
    const onLeave = () => delete root.dataset.visible
    const onPress = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return
      pressed = true
      root.dataset.pressed = ''
    }
    const onRelease = () => {
      if (!pressed) return
      pressed = false
      delete root.dataset.pressed
      recheck()
    }

    const html = document.documentElement
    // Hides the native cursor (globals.css) only while this one is mounted.
    html.dataset.customCursor = ''
    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('click', onClick, { passive: true })
    // Capture phase, so a carousel's own drag handler can't swallow them.
    document.addEventListener('pointerdown', onPress, { capture: true, passive: true })
    document.addEventListener('pointerup', onRelease, { capture: true, passive: true })
    document.addEventListener('pointercancel', onRelease, { capture: true, passive: true })
    window.addEventListener('blur', onRelease)
    window.addEventListener('scroll', recheck, { passive: true })
    html.addEventListener('mouseleave', onLeave)

    return () => {
      delete html.dataset.customCursor
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointerdown', onPress, { capture: true })
      document.removeEventListener('pointerup', onRelease, { capture: true })
      document.removeEventListener('pointercancel', onRelease, { capture: true })
      window.removeEventListener('blur', onRelease)
      window.removeEventListener('scroll', recheck)
      html.removeEventListener('mouseleave', onLeave)
      window.clearTimeout(leaveTimer)
      zones.destroy()
      gsap.killTweensOf(ring)
    }
  }, [finePointer])

  if (!finePointer) return null

  return (
    <div ref={rootRef} aria-hidden className={styles.cursor}>
      {/* Position lives on the follower, press on `.press`, state on the ring and dot:
          three `scale`s that compose instead of overwriting each other. */}
      <div ref={ringRef} className={styles.follower}>
        <div className={styles.press}>
          <div className={styles.ring} />
          {VARIANTS.map((variant) => (
            <span key={variant} className={styles.label} data-variant={variant}>
              {CURSOR_LABELS[variant]}
            </span>
          ))}
        </div>
      </div>
      <div ref={dotRef} className={styles.follower}>
        <div className={styles.press}>
          <div className={styles.dot} />
        </div>
      </div>
    </div>
  )
}

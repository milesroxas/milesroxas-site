'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useContext, useEffect, useRef, useState } from 'react'
import { CursorContext, type CursorVariant } from './CursorProvider'
import styles from './cursor.module.css'

gsap.registerPlugin(useGSAP)

// How each layer chases the pointer. The ring trails the dot; the label rides with the ring.
const DOT_FOLLOW: gsap.TweenVars = { duration: 0.1, ease: 'power2.out' }
const RING_FOLLOW: gsap.TweenVars = { duration: 0.2, ease: 'power3.out' }
const STATE_CHANGE: gsap.TweenVars = { duration: 0.2, ease: 'power2.out', overwrite: 'auto' }
const FADE: gsap.TweenVars = { duration: 0.3, ease: 'power2.out', overwrite: 'auto' }

// White reads as inverse ink under `mix-blend-mode: difference`. The button ring takes `--brand`.
const RING_VARIANTS: Record<CursorVariant, gsap.TweenVars> = {
  default: { backgroundColor: 'transparent', borderColor: 'white', borderWidth: 1, scale: 1 },
  text: { backgroundColor: 'transparent', borderColor: 'white', borderWidth: 1, scale: 1.5 },
  button: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 0.8, scale: 1.5 },
  link: { backgroundColor: 'white', borderColor: 'transparent', borderWidth: 0, scale: 1.2 },
  media: { backgroundColor: 'transparent', borderColor: 'white', borderWidth: 1, scale: 2 },
  slider: { backgroundColor: 'transparent', borderColor: 'white', borderWidth: 1, scale: 1.5 },
}

const VARIANT_TEXT: Partial<Record<CursorVariant, string>> = { slider: 'Drag' }

type Follower = { x: gsap.QuickToFunc; y: gsap.QuickToFunc }

const Cursor = () => {
  const { variant, customText } = useContext(CursorContext)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const cursorTextRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  // Resolved after mount, so server and client render the same (nothing) first.
  const [finePointer, setFinePointer] = useState(false)
  const followersRef = useRef<Follower[]>([])
  const placedRef = useRef(false)

  const showText = variant === 'slider'

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  useGSAP(() => {
    if (!cursorOuterRef.current || !cursorInnerRef.current || !cursorTextRef.current) return

    const layers: [HTMLDivElement, gsap.TweenVars][] = [
      [cursorOuterRef.current, RING_FOLLOW],
      [cursorInnerRef.current, DOT_FOLLOW],
      [cursorTextRef.current, RING_FOLLOW],
    ]

    // Percent offsets center every layer on the pointer, so sizes live only in the CSS
    followersRef.current = layers.map(([el, follow]) => {
      gsap.set(el, { xPercent: -50, yPercent: -50 })
      return { x: gsap.quickTo(el, 'x', follow), y: gsap.quickTo(el, 'y', follow) }
    })
  }, [finePointer])

  useGSAP(
    () => {
      const ring = cursorOuterRef.current
      const dot = cursorInnerRef.current
      const label = cursorTextRef.current
      if (!ring || !dot || !label || !isVisible) return

      gsap.to(ring, {
        ...RING_VARIANTS[variant],
        ...(variant === 'button' && {
          borderColor: getComputedStyle(ring).getPropertyValue('--brand').trim(),
        }),
        ...STATE_CHANGE,
      })

      if (showText) {
        // The dot shrinks out, then the label fades in.
        gsap.to(dot, {
          ...STATE_CHANGE,
          opacity: 0,
          scale: 0.5,
          onComplete: () => {
            gsap.set(dot, { visibility: 'hidden' })
            gsap.to(label, { ...FADE, opacity: 1, scale: 1 })
          },
        })
      } else {
        gsap.to(label, { ...STATE_CHANGE, opacity: 0 })
        gsap.to(dot, {
          ...STATE_CHANGE,
          opacity: 1,
          scale: variant === 'default' ? 1 : 1.5,
          visibility: 'visible',
        })
      }
    },
    { dependencies: [variant, isVisible, showText] },
  )

  useEffect(() => {
    if (!finePointer) return

    const onMouseMove = (e: MouseEvent) => {
      // First sighting lands on the pointer instead of flying in from the corner.
      if (!placedRef.current) {
        placedRef.current = true
        gsap.set([cursorOuterRef.current, cursorInnerRef.current, cursorTextRef.current], {
          x: e.clientX,
          y: e.clientY,
        })
      }
      setIsVisible(true)
      for (const follower of followersRef.current) {
        follower.x(e.clientX)
        follower.y(e.clientY)
      }
    }
    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [finePointer])

  useGSAP(
    () => {
      if (!cursorOuterRef.current || !cursorInnerRef.current || !cursorTextRef.current) return
      const opacity = isVisible ? 1 : 0
      gsap.to(cursorOuterRef.current, { ...FADE, opacity })
      // The variant effect owns whichever of dot or label is hidden.
      gsap.to(showText ? cursorTextRef.current : cursorInnerRef.current, { ...FADE, opacity })
    },
    { dependencies: [isVisible] },
  )

  if (!finePointer) return null

  return (
    <>
      <div
        ref={cursorOuterRef}
        className={`${styles.cursorOuter} ${variant === 'button' ? styles.cursorOuterBlurred : ''}`}
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      />
      <div
        ref={cursorInnerRef}
        className={styles.cursorInner}
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      />
      <div
        ref={cursorTextRef}
        className={`${styles.cursorText} ${variant === 'button' ? styles.cursorTextDark : ''}`}
        style={{ visibility: isVisible && showText ? 'visible' : 'hidden', opacity: 0 }}
      >
        {customText || VARIANT_TEXT[variant] || ''}
      </div>
    </>
  )
}

export default Cursor

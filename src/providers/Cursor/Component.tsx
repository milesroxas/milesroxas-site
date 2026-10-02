'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { type RefObject, useContext, useEffect, useRef, useState } from 'react'
import { CursorContext, type CursorVariant } from './context'
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

type LayerRef = RefObject<HTMLDivElement | null>

type Layers = { ring: HTMLDivElement; dot: HTMLDivElement; label: HTMLDivElement }

/** The ring, dot and label, or null until all three are mounted. */
function readLayers(ringRef: LayerRef, dotRef: LayerRef, labelRef: LayerRef): Layers | null {
  const ring = ringRef.current
  const dot = dotRef.current
  const label = labelRef.current
  return ring && dot && label ? { ring, dot, label } : null
}

function createFollowers({ ring, dot, label }: Layers): Follower[] {
  const layers: [HTMLDivElement, gsap.TweenVars][] = [
    [ring, RING_FOLLOW],
    [dot, DOT_FOLLOW],
    [label, RING_FOLLOW],
  ]

  // Percent offsets center every layer on the pointer, so sizes live only in the CSS
  return layers.map(([el, follow]) => {
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    return { x: gsap.quickTo(el, 'x', follow), y: gsap.quickTo(el, 'y', follow) }
  })
}

function animateVariant({ ring, dot, label }: Layers, variant: CursorVariant, showText: boolean) {
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
}

function fadeLayers({ ring, dot, label }: Layers, isVisible: boolean, showText: boolean) {
  const opacity = isVisible ? 1 : 0
  gsap.to(ring, { ...FADE, opacity })
  // The variant effect owns whichever of dot or label is hidden.
  gsap.to(showText ? label : dot, { ...FADE, opacity })
}

/** Resolved after mount, so server and client render the same (nothing) first. */
function useFinePointer() {
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  return finePointer
}

/** Feeds the pointer to the followers, and shows the cursor while the pointer is on the page. */
function usePointerFollow({
  enabled,
  ring,
  dot,
  label,
  followersRef,
  setIsVisible,
}: {
  enabled: boolean
  ring: LayerRef
  dot: LayerRef
  label: LayerRef
  followersRef: RefObject<Follower[]>
  setIsVisible: (visible: boolean) => void
}) {
  const placedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const onMouseMove = (e: MouseEvent) => {
      // First sighting lands on the pointer instead of flying in from the corner.
      if (!placedRef.current) {
        placedRef.current = true
        gsap.set([ring.current, dot.current, label.current], {
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
  }, [enabled, ring, dot, label, followersRef, setIsVisible])
}

function CursorLayers({
  ringRef,
  dotRef,
  labelRef,
  variant,
  customText,
  isVisible,
  showText,
}: {
  ringRef: LayerRef
  dotRef: LayerRef
  labelRef: LayerRef
  variant: CursorVariant
  customText?: string
  isVisible: boolean
  showText: boolean
}) {
  const visibility = isVisible ? 'visible' : 'hidden'

  return (
    <>
      <div
        ref={ringRef}
        className={`${styles.cursorOuter} ${variant === 'button' ? styles.cursorOuterBlurred : ''}`}
        style={{ visibility }}
      />
      <div ref={dotRef} className={styles.cursorInner} style={{ visibility }} />
      <div
        ref={labelRef}
        className={`${styles.cursorText} ${variant === 'button' ? styles.cursorTextDark : ''}`}
        style={{ visibility: isVisible && showText ? 'visible' : 'hidden', opacity: 0 }}
      >
        {customText || VARIANT_TEXT[variant] || ''}
      </div>
    </>
  )
}

const Cursor = () => {
  const { variant, customText } = useContext(CursorContext)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const cursorTextRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const finePointer = useFinePointer()
  const followersRef = useRef<Follower[]>([])

  const showText = variant === 'slider'
  const layers = () => readLayers(cursorOuterRef, cursorInnerRef, cursorTextRef)

  useGSAP(() => {
    const els = layers()
    if (els) followersRef.current = createFollowers(els)
  }, [finePointer])

  useGSAP(
    () => {
      const els = layers()
      if (els && isVisible) animateVariant(els, variant, showText)
    },
    { dependencies: [variant, isVisible, showText] },
  )

  usePointerFollow({
    enabled: finePointer,
    ring: cursorOuterRef,
    dot: cursorInnerRef,
    label: cursorTextRef,
    followersRef,
    setIsVisible,
  })

  useGSAP(
    () => {
      const els = layers()
      if (els) fadeLayers(els, isVisible, showText)
    },
    { dependencies: [isVisible] },
  )

  if (!finePointer) return null

  return (
    <CursorLayers
      customText={customText}
      dotRef={cursorInnerRef}
      isVisible={isVisible}
      labelRef={cursorTextRef}
      ringRef={cursorOuterRef}
      showText={showText}
      variant={variant}
    />
  )
}

export default Cursor

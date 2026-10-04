'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './cursor.module.css'
import { CURSOR_LABELS, type CursorVariant, isCursorVariant } from './variants'

const VARIANTS = Object.keys(CURSOR_LABELS) as CursorVariant[]

function variantAt(target: EventTarget | null): CursorVariant | null {
  if (!(target instanceof Element)) return null
  const value = target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor
  return value && isCursorVariant(value) ? value : null
}

/** A pill around the label, centred in the shape; no label falls back to the CSS dot. */
function clipTo(label: HTMLElement | undefined) {
  return label ? `inset(0 calc(50% - ${label.offsetWidth / 2}px) round 999px)` : ''
}

/** Resolved after mount, so server and client render the same (nothing) first. */
function useFinePointer() {
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  return finePointer
}

/** A dot that opens into a labelled pill over any `cursorTarget` element. */
export function Cursor() {
  const finePointer = useFinePointer()
  const rootRef = useRef<HTMLDivElement>(null)
  const shapeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const shape = shapeRef.current
    if (!finePointer || !root || !shape) return

    const labels = Array.from(shape.children as HTMLCollectionOf<HTMLElement>)
    let current: CursorVariant | null = null
    let x = 0
    let y = 0

    const show = (variant: CursorVariant | null) => {
      if (variant === current) return
      current = variant
      for (const label of labels) {
        label.toggleAttribute('data-active', label.dataset.variant === variant)
      }
      shape.style.clipPath = clipTo(labels.find((label) => label.dataset.variant === variant))
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.dataset.visible = ''
      show(variantAt(e.target))
    }
    // Content scrolls under a still pointer without a mousemove.
    const onScroll = () => show(variantAt(document.elementFromPoint(x, y)))
    const onLeave = () => delete root.dataset.visible

    const html = document.documentElement
    document.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    html.addEventListener('mouseleave', onLeave)

    return () => {
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      html.removeEventListener('mouseleave', onLeave)
    }
  }, [finePointer])

  if (!finePointer) return null

  return (
    <div ref={rootRef} aria-hidden className={styles.cursor}>
      <div ref={shapeRef} className={styles.shape}>
        {VARIANTS.map((variant) => (
          <span key={variant} className={styles.label} data-variant={variant}>
            {CURSOR_LABELS[variant]}
          </span>
        ))}
      </div>
    </div>
  )
}

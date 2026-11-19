'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { normalizeShader, type ShaderConfig } from '@/features/aim-field/config'
import type { FieldHandle, FieldPointer } from '@/features/aim-field/field'
import preset from '@/features/aim-field/preset.json'
import { whenIdle } from '@/utilities/whenIdle'
import styles from './cta-link.module.css'
import { CROSSHAIR } from './look'

const PRESET = normalizeShader(preset as Partial<ShaderConfig>)

/** How far past its host a lock box may draw, so an edge-aligned element keeps its corners. */
const LOCK_MARGIN = 24

const pad = (n: number) => String(Math.max(0, n)).padStart(3, '0')
const READOUTS: Record<string, (p: FieldPointer) => string> = {
  cell: (p) => `${pad(p.cellX)}·${pad(p.cellY)}`,
  target: (p) => (p.inside ? p.target : 'idle'),
}

/**
 * The aim field for a CTA link: the canvas under its host's content, and the
 * reticle and crosshair over it. Its host (the parent element) must be
 * `relative isolate`; the field paints with the host's background and text
 * colour, so it follows the band theme.
 *
 * The reticle is portalled last into the host with no z-index, so it paints
 * over the content without being a stacking context: its lines blend against
 * what is really under them (`tone`: inverting white, or signal orange). The
 * crosshair is DOM for the same reason; the shader's own line would sit under
 * the content.
 *
 * The runtime loads after idle in its own chunk (docs/performance.md); until
 * then the host's flat surface shows.
 */
export function AimLayer({
  config,
  canvasClassName,
  reticle = true,
  readouts = true,
  tone = 'invert',
}: {
  config: Partial<ShaderConfig>
  canvasClassName?: string
  /** Off for a field nested under another, so only one draws the cursor. */
  reticle?: boolean
  /** Off for a layer nested over another field, so only one writes the readouts. */
  readouts?: boolean
  tone?: 'invert' | 'spot'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)
  const crossRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<FieldHandle | null>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => setHost(canvasRef.current?.parentElement?.parentElement ?? null), [])

  const full: ShaderConfig = {
    ...normalizeShader({
      ...PRESET,
      ...config,
      // The DOM crosshair replaces the shader's when this layer draws the cursor.
      ...(reticle ? { crosshair: false } : {}),
    }),
  }
  const fullRef = useRef(full)
  fullRef.current = full

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !host || (reticle && !reticleRef.current)) return
    const outs = readouts ? Array.from(host.querySelectorAll<HTMLElement>('[data-aim-out]')) : []
    const onPointer = outs.length
      ? (p: FieldPointer) => {
          for (const el of outs) el.textContent = READOUTS[el.dataset.aimOut ?? '']?.(p) ?? ''
        }
      : undefined

    const pointer = { x: -1, y: -1 }
    const cross = crossRef.current
    const [lineX, lineY] = cross ? Array.from(cross.children as HTMLCollectionOf<HTMLElement>) : []
    const place = () => {
      if (!cross || !lineX || !lineY) return
      const r = cross.getBoundingClientRect()
      const x = pointer.x - r.left
      const y = pointer.y - r.top
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height
      cross.style.visibility = inside ? 'visible' : 'hidden'
      if (!inside) return
      lineX.style.transform = `translateY(${y}px)`
      lineY.style.transform = `translateX(${x}px)`
      const g = CROSSHAIR.gap
      const mask = (dir: string, at: number) =>
        `linear-gradient(${dir}, #000 ${at - g}px, transparent ${at - g}px, transparent ${at + g}px, #000 ${at + g}px)`
      lineX.style.maskImage = mask('to right', x)
      lineY.style.maskImage = mask('to bottom', y)
    }
    const track = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      place()
    }
    const hide = () => {
      if (cross) cross.style.visibility = 'hidden'
    }
    if (reticle) {
      window.addEventListener('pointermove', track, { passive: true })
      window.addEventListener('scroll', place, { passive: true, capture: true })
      document.documentElement.addEventListener('pointerleave', hide)
    }

    let cancelled = false
    const hideCursor = fullRef.current.hideCursor && window.matchMedia('(pointer: fine)').matches
    const cancelIdle = whenIdle(() => {
      void import('@/features/aim-field/field').then(({ createShaderField }) => {
        if (cancelled) return
        try {
          handleRef.current = createShaderField(canvas, fullRef.current, {
            reticle: reticle ? reticleRef.current : null,
            palette: host,
            onPointer,
          })
        } catch {
          handleRef.current = null
        }
        if (handleRef.current && hideCursor) host.classList.add('cursor-none', '[&_*]:cursor-none')
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
      window.removeEventListener('pointermove', track)
      window.removeEventListener('scroll', place, { capture: true })
      document.documentElement.removeEventListener('pointerleave', hide)
      handleRef.current?.destroy()
      handleRef.current = null
      host.classList.remove('cursor-none', '[&_*]:cursor-none')
    }
  }, [host, reticle, readouts])

  const key = JSON.stringify(full)
  useEffect(() => {
    handleRef.current?.update(fullRef.current)
  }, [key])

  return (
    <>
      {/* m-0: the band's space-y margin would shrink an inset-0 layer. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 m-0 overflow-hidden ${canvasClassName ?? ''}`}
      >
        <canvas className="block size-full" ref={canvasRef} />
      </div>
      {reticle &&
        host &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none absolute m-0 overflow-hidden"
            style={{ inset: -LOCK_MARGIN }}
          >
            <div
              className="absolute"
              data-tone={tone}
              ref={reticleRef}
              style={{ inset: LOCK_MARGIN }}
            />
            <div
              className={`${styles.crosshair} absolute overflow-hidden`}
              ref={crossRef}
              style={{ inset: LOCK_MARGIN, visibility: 'hidden' }}
            >
              <span className="absolute inset-x-0 top-0 h-px -translate-y-1/2" />
              <span className="absolute inset-y-0 left-0 w-px -translate-x-1/2" />
            </div>
          </div>,
          host,
        )}
    </>
  )
}

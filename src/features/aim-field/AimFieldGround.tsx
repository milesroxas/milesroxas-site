'use client'

import { useEffect, useRef } from 'react'

import { whenIdle } from '@/utilities/whenIdle'
import { normalizeShader, type ShaderConfig } from './config'
import type { FieldHandle } from './field'
import preset from './preset.json'

/** The look dialled in at /lab/brand/shader; re-harvest the lab's saved JSON to change it. */
const CONFIG = normalizeShader(preset as Partial<ShaderConfig>)

/**
 * The aim field as a band's ground: the canvas under the band's content and
 * the reticle over it. Its host (the band) must be `relative isolate`; the
 * field paints with the band's own background and text colour, so it follows
 * the band theme and the visitor's light or dark choice. The runtime loads
 * after idle in its own chunk (docs/performance.md); until then the band's
 * flat surface shows.
 */
export function AimFieldGround() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement?.parentElement
    if (!canvas || !host) return
    let handle: FieldHandle | null = null
    let cancelled = false
    const hideCursor = CONFIG.hideCursor && window.matchMedia('(pointer: fine)').matches
    const cancelIdle = whenIdle(() => {
      void import('./field').then(({ createShaderField }) => {
        if (cancelled) return
        try {
          handle = createShaderField(canvas, CONFIG, {
            reticle: reticleRef.current,
            palette: host,
          })
        } catch {
          handle = null
        }
        if (!handle) return
        host.dataset.aimHost = ''
        if (hideCursor) host.classList.add('cursor-none', '[&_*]:cursor-none')
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
      handle?.destroy()
      delete host.dataset.aimHost
      host.classList.remove('cursor-none', '[&_*]:cursor-none')
    }
  }, [])

  return (
    <>
      {/* m-0: the band's space-y margin would shrink an inset-0 layer. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 m-0 overflow-hidden">
        <canvas className="block size-full" ref={canvasRef} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 m-0 overflow-hidden"
        ref={reticleRef}
      />
    </>
  )
}

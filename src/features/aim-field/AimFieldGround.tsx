'use client'

import { useEffect, useRef } from 'react'

import { whenIdle } from '@/utilities/whenIdle'
import { normalizeShader, type ShaderConfig } from './config'
import type { FieldHandle, FieldPointer } from './field'
import preset from './preset.json'

/** The look dialled in at /lab/brand/shader; re-harvest the lab's saved JSON to change it. */
const PRESET = normalizeShader(preset as Partial<ShaderConfig>)

/**
 * Where the field paints, each a tweak on the one preset. `band` grounds a
 * whole band (Section, Field hero) and stays quiet under its copy. `panel`
 * is a bounded ink frame with nothing on it (Instrument hero), so its marks
 * read stronger.
 */
const LOOKS = {
  band: PRESET,
  panel: normalizeShader({ ...PRESET, tone: 0.18 }),
} as const satisfies Record<string, ShaderConfig>

export type AimFieldLook = keyof typeof LOOKS

/**
 * Readouts the field writes into its host: any `[data-aim-out]` element
 * inside the host gets the named value as text, so a server-rendered band
 * can show the live aim without a client component of its own.
 */
const pad = (n: number) => String(Math.max(0, n)).padStart(3, '0')
const READOUTS: Record<string, (p: FieldPointer) => string> = {
  cell: (p) => `${pad(p.cellX)}·${pad(p.cellY)}`,
  target: (p) => (p.inside ? p.target : 'idle'),
}

/**
 * The aim field as a band's ground: the canvas under the band's content and
 * the reticle over it. Its host (the parent element) must be
 * `relative isolate`; the field paints with the host's own background and
 * text colour, so it follows the band theme and the visitor's light or dark
 * choice. The runtime loads after idle in its own chunk
 * (docs/performance.md); until then the host's flat surface shows.
 */
export function AimFieldGround({ look = 'band' }: { look?: AimFieldLook }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement?.parentElement
    if (!canvas || !host) return
    const config = LOOKS[look]
    const outs = Array.from(host.querySelectorAll<HTMLElement>('[data-aim-out]'))
    const onPointer = outs.length
      ? (p: FieldPointer) => {
          for (const el of outs) el.textContent = READOUTS[el.dataset.aimOut ?? '']?.(p) ?? ''
        }
      : undefined
    let handle: FieldHandle | null = null
    let cancelled = false
    const hideCursor = config.hideCursor && window.matchMedia('(pointer: fine)').matches
    const cancelIdle = whenIdle(() => {
      void import('./field').then(({ createShaderField }) => {
        if (cancelled) return
        try {
          handle = createShaderField(canvas, config, {
            reticle: reticleRef.current,
            palette: host,
            onPointer,
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
  }, [look])

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

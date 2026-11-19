'use client'

/**
 * Instrument's paint: the preview picture comes in through large cells where
 * the pointer passes, over the panel's field. A painted cell steps from a
 * mosaic block (its average colour) to the sharp picture. Past
 * `completeAt` per cent revealed, or on `fill` (a click, keyboard focus),
 * the rest floods in from the pointer. A ring on the pointer, inverted
 * against what is under it, shows where the brush is. Touch has no hover, so
 * it shows the plain picture.
 */

import { useEffect, useRef, useState } from 'react'

export type PaintParams = {
  cell: number
  brush: number
  fadeIn: number
  hold: number
  fadeOut: number
  levels: number
  mosaic: boolean
  flood: number
  /** Past this share revealed (0-100), the rest floods in on its own. 100 = never. */
  completeAt: number
  /** A ring on the pointer, inverted against whatever is below: the site cursor's size, the brush's reach, or none. */
  ring: 'site' | 'brush' | 'off'
}

type Img = { src: string; width: number; height: number }

export function PixelReveal({
  image,
  params,
  fill,
  readout,
}: {
  image: Img
  params: PaintParams
  fill: boolean
  readout?: React.RefObject<HTMLElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brushRef = useRef<HTMLCanvasElement>(null)
  const paramsRef = useRef(params)
  paramsRef.current = params
  const fillRef = useRef(fill)
  fillRef.current = fill
  const [canHover, setCanHover] = useState(true)

  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    const brush = brushRef.current?.getContext('2d')
    if (!canvas || !host || !ctx || !brush || !canHover) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const img = new Image()
    img.decoding = 'async'
    img.src = image.src
    let ready = false

    const sharp = document.createElement('canvas')
    const small = document.createElement('canvas')
    let w = 0
    let h = 0
    let dpr = 1
    let cell = 1
    let cols = 0
    let rows = 0
    let value = new Float32Array(0)
    let painted = new Float64Array(0)

    const bake = () => {
      if (!ready || !w || !h) return
      sharp.width = w
      sharp.height = h
      const s = sharp.getContext('2d')
      if (!s) return
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      s.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      small.width = cols
      small.height = rows
      const m = small.getContext('2d')
      if (!m) return
      m.imageSmoothingEnabled = true
      m.imageSmoothingQuality = 'high'
      m.drawImage(sharp, 0, 0, cols * cell, rows * cell, 0, 0, cols, rows)
    }

    const layout = () => {
      const r = host.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = Math.max(1, Math.round(r.width * dpr))
      h = Math.max(1, Math.round(r.height * dpr))
      canvas.width = w
      canvas.height = h
      if (brush.canvas) {
        brush.canvas.width = w
        brush.canvas.height = h
      }
      cell = Math.max(4, Math.round(paramsRef.current.cell * dpr))
      cols = Math.ceil(w / cell)
      rows = Math.ceil(h / cell)
      value = new Float32Array(cols * rows)
      painted = new Float64Array(cols * rows).fill(-1)
      bake()
    }
    img.onload = () => {
      ready = true
      bake()
    }
    const ro = new ResizeObserver(layout)
    ro.observe(host)
    layout()

    const stamp = (x: number, y: number, now: number) => {
      const reach = paramsRef.current.brush
      const cx = x / cell
      const cy = y / cell
      const r = Math.ceil(reach)
      for (let j = Math.floor(cy) - r; j <= Math.floor(cy) + r; j++) {
        if (j < 0 || j >= rows) continue
        for (let i = Math.floor(cx) - r; i <= Math.floor(cx) + r; i++) {
          if (i < 0 || i >= cols) continue
          if (Math.hypot(i + 0.5 - cx, j + 0.5 - cy) <= reach) painted[j * cols + i] = now
        }
      }
    }

    let last: { x: number; y: number } | null = null
    const aim = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = host.getBoundingClientRect()
      // Window-level: a lock overlay sits over the panel and takes its pointer events.
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        last = null
        return
      }
      const x = (e.clientX - r.left) * dpr
      const y = (e.clientY - r.top) * dpr
      aim.x = x
      aim.y = y
      const now = performance.now()
      if (last) {
        const steps = Math.max(1, Math.ceil(Math.hypot(x - last.x, y - last.y) / (cell * 0.4)))
        for (let k = 1; k <= steps; k++) {
          stamp(last.x + ((x - last.x) * k) / steps, last.y + ((y - last.y) * k) / steps, now)
        }
      } else stamp(x, y, now)
      last = { x, y }
    }
    const onLeave = () => {
      last = null
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const ring = { x: 0, y: 0, a: 0, placed: false }
    let floodAt = -1
    let complete = false
    let floodFrom = { x: 0, y: 0 }
    let prev = performance.now()
    let raf = 0
    let shown = -1

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(100, now - prev)
      prev = now
      const p = paramsRef.current
      const still = reduced.matches

      const filling = fillRef.current || complete
      if (filling && floodAt < 0) {
        floodAt = now
        floodFrom = last ? { ...aim } : { x: w / 2, y: h / 2 }
      } else if (!filling) floodAt = -1
      const floodR = floodAt < 0 ? -1 : still ? Infinity : ((now - floodAt) / 1000) * p.flood * dpr

      ctx.clearRect(0, 0, w, h)
      ctx.imageSmoothingEnabled = false
      let full = 0
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          const t = painted[k] ?? -1
          const held = t >= 0 && (p.hold <= 0 || now - t < p.hold * 1000)
          const flooded =
            floodR >= 0 &&
            Math.hypot((i + 0.5) * cell - floodFrom.x, (j + 0.5) * cell - floodFrom.y) <= floodR
          const want = held || flooded ? 1 : 0
          let v = value[k] ?? 0
          const span = want > v ? p.fadeIn : p.fadeOut
          v =
            still || span <= 0
              ? want
              : want > v
                ? Math.min(want, v + dt / span)
                : Math.max(want, v - dt / span)
          value[k] = v
          if (v >= 0.999) full++
          if (v <= 0 || !ready) continue
          const q = p.levels <= 1 ? (v >= 0.5 ? 1 : 0) : Math.ceil(v * p.levels) / p.levels
          const x = i * cell
          const y = j * cell
          if (p.mosaic) {
            ctx.globalAlpha = Math.min(1, q * 2)
            ctx.drawImage(small, i, j, 1, 1, x, y, cell, cell)
            const crisp = Math.max(0, q * 2 - 1)
            if (crisp > 0) {
              ctx.globalAlpha = crisp
              ctx.drawImage(sharp, x, y, cell, cell, x, y, cell, cell)
            }
          } else {
            ctx.globalAlpha = q
            ctx.drawImage(sharp, x, y, cell, cell, x, y, cell, cell)
          }
        }
      }
      ctx.globalAlpha = 1

      brush.clearRect(0, 0, w, h)
      const on = p.ring !== 'off' && last !== null
      if (on && !ring.placed) {
        ring.x = aim.x
        ring.y = aim.y
        ring.placed = true
      }
      if (!on && ring.a <= 0) ring.placed = false
      // On the pointer, never trailing it.
      ring.x = aim.x
      ring.y = aim.y
      ring.a += ((on ? 1 : 0) - ring.a) * (still ? 1 : 1 - Math.exp(-dt / 50))
      if (ring.a > 0.01 && p.ring !== 'off') {
        const radius = p.ring === 'brush' ? p.brush * cell : 20 * dpr
        brush.globalAlpha = ring.a * 0.8
        brush.strokeStyle = '#fff'
        brush.lineWidth = Math.max(1, dpr)
        brush.beginPath()
        brush.arc(ring.x, ring.y, radius, 0, Math.PI * 2)
        brush.stroke()
        brush.globalAlpha = 1
      }
      const pct = cols * rows ? Math.round((full / (cols * rows)) * 100) : 0
      if (!complete && p.completeAt < 100 && pct >= p.completeAt) complete = true
      if (pct !== shown && readout?.current) {
        shown = pct
        readout.current.textContent = `${String(pct).padStart(3, '0')}/100`
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [image.src, params.cell, canHover, readout])

  if (!canHover) {
    return (
      // biome-ignore lint/performance/noImgElement: prototype
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        height={image.height}
        src={image.src}
        width={image.width}
      />
    )
  }
  return (
    <>
      <canvas
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        ref={canvasRef}
      />
      <canvas
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 size-full mix-blend-difference"
        ref={brushRef}
      />
    </>
  )
}

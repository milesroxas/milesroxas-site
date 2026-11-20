'use client'

/**
 * Randomized pixel paint between tab pictures, on one WebGL2 quad. The panel
 * is a grid of cells; each cell gets its own random start inside the swap. A
 * cell first breaks the outgoing picture into coarser blocks, flips to the
 * incoming picture as one solid cell-sized block, then halves its block size
 * each stage until the picture is sharp. The outgoing frame is whatever was
 * on screen when the swap began (rendered into a texture), so a swap that
 * interrupts another picks up mid-paint without a pop.
 *
 * A video tab paints its own first frame, read from the player the block
 * parks under the canvas, and hands off to that player when the paint lands
 * (`handoff`). A frame the browser will not hand over (an HLS stream in some
 * Safari builds comes through blank) paints the poster instead, and the
 * canvas fades off it onto the playing video.
 *
 * The context starts only once the panel nears the viewport, and a browser
 * without WebGL2 (or a lost context) reports `onUnsupported` so the block
 * falls back to plain pictures. Reduced motion swaps at once.
 */

import { useEffect, useRef, useState } from 'react'
import { warmVideo } from '@/components/Media/VideoMedia'

export type PaintDials = {
  /** Total swap time, ms. */
  duration: number
  /** Cubic-bezier on the swap's clock. */
  ease: [number, number, number, number]
  /** Cell size, CSS px: the grid the random order runs on and the coarsest block. */
  cell: number
  /** 0 = every cell at once, 1 = cells strictly one after another. */
  spread: number
  /** 0 = each cell independent, 1 = cells move in 4×4 clumps. */
  clump: number
  /** Halvings from the coarsest block to sharp. */
  steps: number
  /** Share of a cell's time spent breaking up the outgoing picture. */
  dissolve: number
  /** Spot-colour wash on a freshly flipped coarse block, 0–1. */
  flash: number
}

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform sampler2D uNext;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uP;
uniform float uCell;
uniform float uSpread;
uniform float uClump;
uniform float uSteps;
uniform float uDissolve;
uniform float uFlash;
uniform float uSeed;
uniform vec3 uAccent;
uniform float uTone;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Screen px (top-left origin) of the centre of the block holding px.
vec2 blockAt(vec2 px, float size) { return (floor(px / size) + 0.5) * size; }

vec4 prevAt(vec2 px) { return texture(uPrev, vec2(px.x / uRes.x, 1.0 - px.y / uRes.y)); }

vec4 nextAt(vec2 px) {
  vec2 uv = px / uRes;
  float sr = uRes.x / uRes.y;
  float ir = uImg.x / uImg.y;
  vec2 s = sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0);
  return vec4(pow(texture(uNext, (uv - 0.5) * s + 0.5).rgb, vec3(uTone)), 1.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 c = floor(px / uCell);
  float r = mix(hash(c), hash(floor(c / 4.0) + 17.0), uClump);
  float sp = clamp(uSpread, 0.0, 0.98);
  float t = clamp((uP - r * sp) / (1.0 - sp), 0.0, 1.0);

  if (t <= 0.0) { outColor = prevAt(px); return; }

  if (t < uDissolve) {
    // Outgoing: sharp, then blocks doubling up to the cell.
    float stage = floor((t / uDissolve) * (uSteps + 1.0));
    if (stage < 1.0) { outColor = prevAt(px); return; }
    float size = uCell / exp2(uSteps - stage);
    outColor = prevAt(blockAt(px, size));
    return;
  }

  // Incoming: one cell-sized block, halving each stage, then sharp.
  float k = uDissolve < 1.0 ? (t - uDissolve) / (1.0 - uDissolve) : 1.0;
  float stage = floor(k * (uSteps + 1.0));
  vec4 col;
  if (stage >= uSteps) col = nextAt(px);
  else col = nextAt(blockAt(px, uCell / exp2(stage)));
  float wash = uFlash * (1.0 - min(1.0, stage / max(1.0, uSteps)));
  outColor = vec4(mix(col.rgb, uAccent, wash), 1.0);
}`

/** Solves a CSS cubic-bezier for y at x. */
function bezier([x1, y1, x2, y2]: [number, number, number, number]) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    let t = x
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2
      if (at(x1, x2, t) < x) lo = t
      else hi = t
    }
    return at(y1, y2, t)
  }
}

/** Any CSS colour (oklch included) to linear 0–1 rgb, via a 1px 2D canvas. */
function rgbOf(css: string): [number, number, number] {
  const c = document.createElement('canvas')
  c.width = 1
  c.height = 1
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) return [1, 0.4, 0]
  x.fillStyle = css
  x.fillRect(0, 0, 1, 1)
  const [r = 255, g = 102, b = 0] = x.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

/** A frame is ready to read: decoded, settled, and the opening one. */
const atFirstFrame = (video: HTMLVideoElement) =>
  video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
  !video.seeking &&
  video.currentTime < 0.04

/** Resolves true once the video holds its first frame, false after `ms`. */
const firstFrame = (video: HTMLVideoElement, ms: number) =>
  new Promise<boolean>((resolve) => {
    if (atFirstFrame(video)) return resolve(true)
    const events = ['loadeddata', 'seeked', 'canplay'] as const
    const check = () => {
      if (atFirstFrame(video)) done(true)
    }
    const timer = setTimeout(() => done(atFirstFrame(video)), ms)
    function done(value: boolean) {
      clearTimeout(timer)
      for (const event of events) video.removeEventListener(event, check)
      resolve(value)
    }
    for (const event of events) video.addEventListener(event, check)
  })

/** What a tab paints: a still, or a video's opening frame (its poster when the frame cannot be read). */
export type PaintSource = { kind: 'image'; src: string } | { kind: 'video'; poster: string | null }

/** A video tab's live layer: the player's wrapper and its `<video>`, read when a swap needs them. */
export type LiveLayer = { wrap: HTMLElement | null; video: HTMLVideoElement | null }

/** How long a swap waits for a video's first frame before painting its poster (ms). */
const FRAME_HOLD = 600
/** The canvas fading off a poster onto the playing video, where the two can differ (ms). */
const POSTER_FADE = 200
/** Longest the handoff waits for the video to present a frame before it shows the player anyway (ms). */
const HANDOFF_LIMIT = 1500

/**
 * A video frame read into WebGL comes out darker in the midtones than the
 * browser draws the same `<video>` (Chrome and WebKit alike, measured on an
 * H.264 clip: 108 reads as 118 on the page). This gamma brings the painted
 * frame onto the playing one, so the handoff does not step in brightness.
 */
const VIDEO_TONE = 0.9

type Picture = {
  tex: WebGLTexture
  w: number
  h: number
  ready: boolean
  loaded: Promise<void>
  /** Gamma on the sampled colour: 1 for stills, `VIDEO_TONE` for video frames. */
  tone: number
}
type Entry =
  | { kind: 'image'; still: Picture }
  | { kind: 'video'; frame: Picture; poster: Picture | null; mode: 'frame' | 'poster' | 'none' }

export function PixelPaint({
  sources,
  active,
  dials,
  readout,
  live,
  onLeave,
  onUnsupported,
}: {
  sources: PaintSource[]
  active: number
  dials: PaintDials
  readout?: React.RefObject<HTMLElement | null>
  /** The live layer for a video tab, mounted by the block under the canvas. */
  live: (index: number) => LiveLayer
  /** A tab the paint just left. */
  onLeave?: (index: number) => void
  onUnsupported: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [near, setNear] = useState(false)
  const props = useRef({ dials, live, onLeave, onUnsupported })
  props.current = { dials, live, onLeave, onUnsupported }
  const goRef = useRef<(to: number) => void>(() => {})
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: '50% 0px' },
    )
    io.observe(canvas)
    return () => io.disconnect()
  }, [])

  const key = sources.map((s) => (s.kind === 'image' ? s.src : `video:${s.poster}`)).join('|')

  // biome-ignore lint/correctness/useExhaustiveDependencies: one GL context per source set (`key`)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !near) return
    const unsupported = () => props.current.onUnsupported()
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false })
    if (!gl) {
      unsupported()
      return
    }
    const onLost = (e: Event) => {
      e.preventDefault()
      unsupported()
    }
    canvas.addEventListener('webglcontextlost', onLost)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vert = compile(gl.VERTEX_SHADER, VERT)
    const frag = compile(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (vert && frag) {
      gl.attachShader(prog, vert)
      gl.attachShader(prog, frag)
      gl.linkProgram(prog)
    }
    if (!vert || !frag || !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.removeEventListener('webglcontextlost', onLost)
      unsupported()
      return
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a hook
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)
    const U = {
      prev: u('uPrev'),
      next: u('uNext'),
      res: u('uRes'),
      img: u('uImg'),
      p: u('uP'),
      cell: u('uCell'),
      spread: u('uSpread'),
      clump: u('uClump'),
      steps: u('uSteps'),
      dissolve: u('uDissolve'),
      flash: u('uFlash'),
      seed: u('uSeed'),
      accent: u('uAccent'),
      tone: u('uTone'),
    }
    gl.uniform1i(U.prev, 0)
    gl.uniform1i(U.next, 1)
    gl.uniform3fv(
      U.accent,
      rgbOf(getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#f05a24'),
    )

    const texture = () => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    }

    const picture = (src?: string): Picture => {
      const pic: Picture = {
        tex: texture(),
        w: 1,
        h: 1,
        ready: false,
        loaded: Promise.resolve(),
        tone: 1,
      }
      if (!src) return pic
      pic.loaded = new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.decoding = 'async'
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, pic.tex)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          pic.w = img.naturalWidth
          pic.h = img.naturalHeight
          pic.ready = true
          resolve()
        }
        img.onerror = () => resolve()
        img.src = src
      })
      return pic
    }

    const entries: Entry[] = sources.map((source) =>
      source.kind === 'image'
        ? { kind: 'image', still: picture(source.src) }
        : {
            kind: 'video',
            frame: { ...picture(), tone: VIDEO_TONE },
            poster: source.poster ? picture(source.poster) : null,
            mode: 'none',
          },
    )
    const shownPicture = (index: number) => {
      const entry = entries[index]
      if (!entry) return null
      if (entry.kind === 'image') return entry.still
      return entry.mode === 'frame' ? entry.frame : entry.mode === 'poster' ? entry.poster : null
    }

    /** Reads the video's current frame into its texture; false when the browser will not hand it over. */
    const uploadFrame = (pic: Picture, video: HTMLVideoElement) => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, pic.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        if (gl.getError() !== gl.NO_ERROR) return false
        pic.w = video.videoWidth || 1
        pic.h = video.videoHeight || 1
        pic.ready = true
        return true
      } catch {
        return false
      }
    }

    // Two screen-sized targets: the frame on screen when a swap begins is drawn into one and read as uPrev.
    const targets = [0, 1].map(() => ({ tex: texture(), fbo: gl.createFramebuffer() }))
    // A tiny target to test whether an uploaded frame came through blank.
    const probe = { tex: texture(), fbo: gl.createFramebuffer() }
    gl.bindTexture(gl.TEXTURE_2D, probe.tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, probe.fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, probe.tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    let prev = 0
    let w = 1
    let h = 1
    let dpr = 1
    const sizeTargets = () => {
      for (const t of targets) {
        gl.bindTexture(gl.TEXTURE_2D, t.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    let next = -1
    let startedAt = 0
    let raw = 1
    let seed = Math.random()
    let raf = 0
    let shown = -1
    /** Bumped by every swap; async steps from an older swap stand down. */
    let gen = 0
    /** The video tab whose player shows in place of the canvas, or one being handed to. */
    let liveIndex = -1

    const draw = (
      into: WebGLFramebuffer | null,
      p: number,
      pic: Picture | null = shownPicture(next),
      size: [number, number] = [w, h],
    ) => {
      const d = props.current.dials
      gl.bindFramebuffer(gl.FRAMEBUFFER, into)
      gl.viewport(0, 0, size[0], size[1])
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, targets[prev]?.tex ?? null)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, pic?.tex ?? null)
      gl.uniform2f(U.res, size[0], size[1])
      gl.uniform2f(U.img, pic?.w ?? 1, pic?.h ?? 1)
      gl.uniform1f(U.tone, pic?.tone ?? 1)
      gl.uniform1f(U.p, pic ? p : 0)
      gl.uniform1f(U.cell, Math.max(2, Math.round(d.cell * dpr)))
      gl.uniform1f(U.spread, d.spread)
      gl.uniform1f(U.clump, d.clump)
      gl.uniform1f(U.steps, Math.round(d.steps))
      gl.uniform1f(U.dissolve, d.dissolve)
      gl.uniform1f(U.flash, d.flash)
      gl.uniform1f(U.seed, seed)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    /** True when every probed pixel is black: Safari has handed over empty HLS frames. */
    const blank = (pic: Picture) => {
      draw(probe.fbo, 1, pic, [8, 8])
      const px = new Uint8Array(8 * 8 * 4)
      gl.readPixels(0, 0, 8, 8, gl.RGBA, gl.UNSIGNED_BYTE, px)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      for (let i = 0; i < px.length; i += 4) {
        if ((px[i] ?? 0) > 6 || (px[i + 1] ?? 0) > 6 || (px[i + 2] ?? 0) > 6) return false
      }
      return true
    }

    const eased = () => bezier(props.current.dials.ease)(raw)

    const writeReadout = (p: number) => {
      const sp = Math.min(0.98, Math.max(0, props.current.dials.spread))
      const done = sp <= 0 ? (p >= 1 ? 1 : 0) : Math.min(1, Math.max(0, (p - 1 + sp) / sp))
      const pct = Math.round(done * 100)
      if (pct !== shown && readout?.current) {
        shown = pct
        readout.current.textContent = `${String(pct).padStart(3, '0')}/100`
      }
    }

    const setCanvas = (visible: boolean, fade = 0) => {
      canvas.style.transition = fade ? `opacity ${fade}ms cubic-bezier(0.23, 1, 0.32, 1)` : 'none'
      canvas.style.opacity = visible ? '1' : '0'
    }
    const setLive = (index: number, visible: boolean) => {
      const wrap = props.current.live(index).wrap
      if (!wrap) return
      wrap.style.opacity = visible ? '1' : '0'
      wrap.style.pointerEvents = visible ? 'auto' : 'none'
    }

    /** Gets a tab's picture ready to paint: a still loaded, or a video parked on its first frame. */
    const prepare = async (index: number, g: number) => {
      const entry = entries[index]
      if (!entry) return
      if (entry.kind === 'image') return entry.still.loaded
      const { video } = props.current.live(index)
      if (video) {
        warmVideo(video)
        if (!video.paused) video.pause()
        if (video.currentTime > 0) {
          try {
            video.currentTime = 0
          } catch {}
        }
        const ready = await firstFrame(video, FRAME_HOLD)
        if (g !== gen) return
        if (ready && uploadFrame(entry.frame, video)) {
          // An all-black frame beside a poster that is not black: the browser handed over nothing.
          if (!blank(entry.frame)) {
            entry.mode = 'frame'
            return
          }
          if (entry.poster) await entry.poster.loaded
          if (g !== gen) return
          if (!entry.poster?.ready || blank(entry.poster)) {
            entry.mode = 'frame'
            return
          }
        }
      }
      if (entry.poster) await entry.poster.loaded
      entry.mode = entry.poster?.ready ? 'poster' : 'none'
    }

    /**
     * Hands a video tab from the canvas to its player once the paint lands.
     * The player sits under the canvas on the frame just painted; it starts,
     * and the canvas leaves on the first frame the video presents, so the two
     * never show different pictures. Off a poster the canvas fades instead,
     * since a poster can differ from the frame.
     */
    const handoff = (index: number, g: number) => {
      const entry = entries[index]
      if (entry?.kind !== 'video') return
      const { video } = props.current.live(index)
      liveIndex = index
      setLive(index, true)
      const exact = entry.mode === 'frame'
      let done = false
      const leave = () => {
        if (done || g !== gen) return
        done = true
        clearTimeout(limit)
        setCanvas(false, exact ? 0 : POSTER_FADE)
      }
      const limit = setTimeout(leave, HANDOFF_LIMIT)
      if (!video) return leave()
      if (typeof video.requestVideoFrameCallback === 'function')
        video.requestVideoFrameCallback(() => leave())
      else video.addEventListener('playing', () => requestAnimationFrame(leave), { once: true })
      // Blocked autoplay leaves the player paused on the painted frame: show it as it is.
      video.play().catch(leave)
    }

    const frame = (now: number) => {
      const d = props.current.dials
      raw = reduced.matches || d.duration <= 0 ? 1 : Math.min(1, (now - startedAt) / d.duration)
      const p = eased()
      draw(null, p)
      writeReadout(p)
      if (raw < 1) raf = requestAnimationFrame(frame)
      else {
        raf = 0
        handoff(next, gen)
      }
    }

    const start = async (to: number) => {
      if (to === next && (raw < 1 || liveIndex === to || entries[to]?.kind === 'image')) return
      const g = ++gen
      cancelAnimationFrame(raf)
      const from = next
      // Freeze what is on screen into the spare target; it becomes the outgoing picture.
      const spare = 1 - prev
      if (liveIndex >= 0) {
        const outgoing = entries[liveIndex]
        const { video } = props.current.live(liveIndex)
        if (outgoing?.kind === 'video' && outgoing.mode === 'frame' && video) {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
            uploadFrame(outgoing.frame, video)
        }
        draw(targets[spare]?.fbo ?? null, 1, shownPicture(liveIndex))
        video?.pause()
      } else draw(targets[spare]?.fbo ?? null, eased())
      prev = spare
      draw(null, 0)
      setCanvas(true)
      if (liveIndex >= 0) setLive(liveIndex, false)
      liveIndex = -1
      if (from >= 0 && from !== to) props.current.onLeave?.(from)
      next = to
      raw = 0
      writeReadout(0)
      await prepare(to, g)
      if (g !== gen) return
      seed = Math.random()
      startedAt = performance.now()
      raf = requestAnimationFrame(frame)
    }
    goRef.current = (to) => void start(to)

    const layout = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      const nw = Math.max(1, Math.round(r.width * dpr))
      const nh = Math.max(1, Math.round(r.height * dpr))
      if (nw === w && nh === h) return
      w = nw
      h = nh
      canvas.width = w
      canvas.height = h
      // Resizing drops the frozen frame; land any swap rather than paint from blank.
      sizeTargets()
      if (raw < 1) {
        raw = 1
        cancelAnimationFrame(raf)
        raf = 0
        draw(null, 1)
        writeReadout(1)
        handoff(next, gen)
      } else if (next >= 0) draw(null, 1)
    }
    const ro = new ResizeObserver(layout)
    ro.observe(canvas)
    layout()
    void start(activeRef.current)

    return () => {
      gen++
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      goRef.current = () => {}
      for (const entry of entries) {
        if (entry.kind === 'image') gl.deleteTexture(entry.still.tex)
        else {
          gl.deleteTexture(entry.frame.tex)
          if (entry.poster) gl.deleteTexture(entry.poster.tex)
        }
      }
      for (const t of [...targets, probe]) {
        gl.deleteTexture(t.tex)
        gl.deleteFramebuffer(t.fbo)
      }
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [key, near])

  useEffect(() => {
    goRef.current(active)
  }, [active])

  return (
    <canvas
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] size-full"
      ref={canvasRef}
    />
  )
}

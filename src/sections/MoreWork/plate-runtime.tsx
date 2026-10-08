'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { type ShaderMaterial, Texture, Vector2, VideoTexture, WebGLRenderTarget } from 'three'
import { FailureBoundary, useCanvasFailure } from '@/features/immersive/ui/failure-boundary'
import { signalFirstFrame } from '@/features/immersive/ui/overlay'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { ContextGuard } from '@/lib/webgl/components/context-guard'
import { MORE_WORK_MOTION } from './motion'
import {
  PLATE_FRAGMENT,
  PLATE_RIPPLE_FRAGMENT,
  PLATE_RIPPLE_VERTEX,
  PLATE_VERTEX,
} from './plate-shader'
import type { PlateSignal } from './signal'

gsap.registerPlugin(CustomEase)

/**
 * The plate's live layer: one small classic WebGL canvas drawing a single
 * clip-space quad, on demand. It samples the plate's own image and video
 * elements, so nothing downloads twice. It draws while a transition runs and
 * on each new frame of a video it shows; a resting still plate draws nothing.
 */

const { duration, ease } = MORE_WORK_MOTION.plate
const { ripple } = MORE_WORK_MOTION

/** The transition's look (`./plate-shader`); its timing is in `./motion`. */
export const PLATE_LOOK = {
  duration: duration / 1000,
  ease: CustomEase.create('more-work-plate', ease.join(',')),
  /** How deep the dithered band is, as a share of the frame. */
  band: 0.45,
  /** How far low noise bends the band's edge. */
  warp: 0.2,
  /** Dither cell, CSS pixels. */
  cell: 2,
  /** Red/blue split at the frame's edge mid-band, in UV. */
  aberration: 0.018,
  /** The arriving picture's starting scale. */
  settle: 1.04,
  /** How much larger the leaving picture drifts. */
  drift: 0.02,
} as const

/** The ripple look (`PLATE_RIPPLE_FRAGMENT`): a wave that travels up the plate and bends its frame. */
export const PLATE_RIPPLE = {
  duration: ripple.duration / 1000,
  ease: CustomEase.create('more-work-ripple', ripple.ease.join(',')),
  /** How much faster a wave runs once another row is waiting. */
  hurry: ripple.hurry,
  /** The deepest vertical stretch, as a share of the frame's height. */
  amplitude: 0.04,
  /** How far the sides swell out where the front passes, as a share of the frame's width. */
  swell: 0.035,
  /** Mesh segments each way: enough that the bent edges read as curves. */
  segments: 64,
  /** Wavelengths up the frame. */
  waves: 1.6,
  /** How far the slopes lighten and darken the picture. */
  shade: 0.09,
  /** How deep the soft front between the pictures is, as a share of the frame. */
  band: 0.85,
  /** How far the plate bows with the scroll at most, as a share of the frame's height. */
  flex: 0.025,
  /** Scroll speed, in rows per second, that bows it about three quarters of the way. */
  flexSpeed: 6,
  /** Seconds the bow takes to close about two thirds of the way to the scroll's speed. */
  flexLag: 0.3,
} as const

/** `dither` sweeps through an ordered dither (More work); `ripple` runs a wave up the picture (the dial). */
export type PlateLook = 'dither' | 'ripple'

// Hoisted so JSX never allocates fresh objects per render.
const GL_CONFIG = { alpha: false, antialias: false, powerPreference: 'high-performance' } as const
/** A bent plate leaves the page showing around it, and its curved edges need smoothing. */
const GL_CONFIG_SHAPED = { ...GL_CONFIG, alpha: true, antialias: true } as const
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 100 } as const
const DPR: [number, number] = [1, 2]
/** R3F writes `pointer-events: auto` on its container; the plate is never a target. */
const CANVAS_STYLE = { pointerEvents: 'none' } as const
const PLANE_ARGS: [number, number] = [2, 2]
const RIPPLE_PLANE_ARGS: [number, number, number, number] = [
  2,
  2,
  PLATE_RIPPLE.segments,
  PLATE_RIPPLE.segments,
]

type PlateElement = HTMLImageElement | HTMLVideoElement
/** What a texture samples: a video as it plays, an image as a still. */
type PlateMedia = HTMLCanvasElement | HTMLVideoElement

/** The picture in each of the plate's layers, in row order; null if any is missing. */
function plateElements(frame: HTMLElement, count: number): PlateElement[] | null {
  const elements = Array.from({ length: count }, (_, i) =>
    frame.querySelector<PlateElement>(`[data-plate-layer="${i}"] :is(img, video)`),
  )
  return elements.every(Boolean) ? (elements as PlateElement[]) : null
}

/** Resolves once the element has pixels to sample; an image that fails rejects. */
function whenDrawable(el: PlateElement, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (el instanceof HTMLVideoElement) {
      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return resolve()
      el.addEventListener('loadeddata', () => resolve(), { once: true, signal })
      return
    }
    if (el.complete && el.naturalWidth > 0) return resolve()
    el.addEventListener('load', () => resolve(), { once: true, signal })
    el.addEventListener('error', () => reject(new Error('plate image')), { once: true, signal })
  })
}

/**
 * An image's pixels at their real size. A responsive `<img>` divides its
 * `naturalWidth` by the srcset density, so three would allocate the texture
 * smaller than the bitmap WebGL uploads, and the upload fails to black.
 */
async function stillOf(img: HTMLImageElement) {
  const bitmap = await createImageBitmap(img)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
  bitmap.close()
  return canvas
}

const mediaAspect = (el: PlateMedia) =>
  el instanceof HTMLVideoElement ? el.videoWidth / el.videoHeight : el.width / el.height

/** The UV scale that fits a picture into the plate like `object-fit: cover`. */
function coverScale(el: PlateMedia, plateAspect: number, out: Vector2) {
  const aspect = mediaAspect(el)
  return aspect > plateAspect ? out.set(plateAspect / aspect, 1) : out.set(1, aspect / plateAspect)
}

/** Calls back on each new frame a video presents, until the returned stop. */
function onVideoFrames(video: HTMLVideoElement, callback: () => void) {
  let handle = 0
  if ('requestVideoFrameCallback' in video) {
    const next = () => {
      callback()
      handle = video.requestVideoFrameCallback(next)
    }
    handle = video.requestVideoFrameCallback(next)
    return () => video.cancelVideoFrameCallback(handle)
  }
  const next = () => {
    callback()
    handle = requestAnimationFrame(next)
  }
  handle = requestAnimationFrame(next)
  return () => cancelAnimationFrame(handle)
}

type PlateSceneProps = {
  media: PlateMedia[]
  index: number
  flex?: PlateSignal
  look: PlateLook
  bleed: number
  onFirstFrame: () => void
}

/**
 * What the transition runs between. `from` is a row's picture, or, when a
 * new row interrupts a transition, a snapshot of the frame as it stood, so
 * the next sweep starts from exactly what was on screen.
 */
type Shown = { from: number | 'snapshot'; to: number }

function PlateScene({ media, index, flex, look, bleed, onFirstFrame }: PlateSceneProps) {
  const size = useThree((state) => state.size)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const materialRef = useRef<ShaderMaterial>(null)
  const framesDrawn = useRef(0)
  const shown = useRef<Shown>({ from: index, to: index })
  const stopVideos = useRef<() => void>(() => {})
  const tween = useRef<gsap.core.Tween | null>(null)
  /** The ripple's next row, waiting for the running wave to pass. */
  const queued = useRef<number | null>(null)

  const textures = useMemo(
    () =>
      media.map((el) => (el instanceof HTMLVideoElement ? new VideoTexture(el) : new Texture(el))),
    [media],
  )
  useEffect(() => {
    for (const texture of textures) texture.needsUpdate = true
    return () => {
      for (const texture of textures) texture.dispose()
    }
  }, [textures])

  // Two, alternated: a snapshot must never be drawn into the target it samples.
  const snapshots = useMemo(
    () => [0, 1].map(() => new WebGLRenderTarget(1, 1, { depthBuffer: false })),
    [],
  )
  const nextSnapshot = useRef(0)
  useEffect(
    () => () => {
      for (const target of snapshots) target.dispose()
    },
    [snapshots],
  )

  // Initial values only: runtime updates go through materialRef.
  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[shown.current.to] as Texture },
      uTo: { value: textures[shown.current.to] as Texture },
      uFromCover: { value: new Vector2(1, 1) },
      uToCover: { value: new Vector2(1, 1) },
      uProgress: { value: 1 },
      uDirection: { value: 1 },
      uAspect: { value: 1 },
      uBand: { value: look === 'ripple' ? PLATE_RIPPLE.band : PLATE_LOOK.band },
      uWarp: { value: PLATE_LOOK.warp },
      uCell: { value: PLATE_LOOK.cell },
      uAberration: { value: PLATE_LOOK.aberration },
      uSettle: { value: PLATE_LOOK.settle },
      uDrift: { value: PLATE_LOOK.drift },
      uAmplitude: { value: PLATE_RIPPLE.amplitude },
      uWaves: { value: PLATE_RIPPLE.waves },
      uShade: { value: PLATE_RIPPLE.shade },
      uSwell: { value: PLATE_RIPPLE.swell },
      uInset: { value: 1 / (1 + 2 * bleed) },
      uFlex: { value: 0 },
      uFlexDepth: { value: PLATE_RIPPLE.flex },
    }),
    [textures, look, bleed],
  )

  /** Draws the frame as it stands into a spare target and returns it. */
  const snapshot = () => {
    const target = snapshots[nextSnapshot.current]
    nextSnapshot.current = 1 - nextSnapshot.current
    const buffer = gl.getDrawingBufferSize(new Vector2())
    target.setSize(buffer.x, buffer.y)
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    return target.texture
  }

  /** Points the uniforms at `shown` and redraws for as long as a video in it plays. */
  const show = (fromTexture?: Texture) => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const { from, to } = shown.current
    const aspect = u.uAspect.value
    if (from === 'snapshot') {
      if (fromTexture) u.uFrom.value = fromTexture
      u.uFromCover.value.set(1, 1)
    } else {
      u.uFrom.value = textures[from]
      coverScale(media[from], aspect, u.uFromCover.value)
    }
    u.uTo.value = textures[to]
    coverScale(media[to], aspect, u.uToCover.value)
    stopVideos.current()
    const playing = [...new Set([from === 'snapshot' ? null : media[from], media[to]])]
    const stops = playing
      .filter((el): el is HTMLVideoElement => el instanceof HTMLVideoElement)
      .map((video) => onVideoFrames(video, invalidate))
    stopVideos.current = () => {
      for (const stop of stops) stop()
    }
    invalidate()
  }

  useEffect(() => () => stopVideos.current(), [])

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uAspect.value = size.width / Math.max(size.height, 1)
    u.uCell.value = PLATE_LOOK.cell * gl.getPixelRatio()
    show()
    // biome-ignore lint/correctness/useExhaustiveDependencies: `show` reads refs; the size is the trigger
  }, [size.width, size.height, gl, show])

  /**
   * Runs a full transition to row `to` from whatever is on screen: the
   * picture at rest, or a snapshot when it lands mid-sweep. The sweep runs
   * down the plate when the list moved down, up when it moved up.
   */
  const start = (to: number) => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const state = shown.current
    const midway = u.uProgress.value < 1
    const fromTexture = midway ? snapshot() : undefined
    const timing = look === 'ripple' ? PLATE_RIPPLE : PLATE_LOOK
    u.uDirection.value = to > state.to ? 1 : -1
    shown.current = { from: midway ? 'snapshot' : state.to, to }
    u.uProgress.value = 0
    show(fromTexture)
    tween.current?.kill()
    tween.current = gsap.to(u.uProgress, {
      value: 1,
      duration: timing.duration,
      ease: timing.ease,
      onUpdate: invalidate,
      onComplete: () => {
        const next = queued.current
        queued.current = null
        if (next !== null && next !== shown.current.to) startRef.current(next)
      },
    })
  }
  const startRef = useRef(start)
  startRef.current = start

  useEffect(
    () => () => {
      tween.current?.kill()
    },
    [],
  )

  // The dither cuts to a new row at once. The ripple never cuts a wave: the
  // newest row waits, and the running wave quickens to make way for it.
  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const running = tween.current?.isActive()
    if (look === 'ripple' && running) {
      queued.current = index === shown.current.to ? null : index
      if (queued.current !== null) {
        gsap.to(tween.current, {
          timeScale: PLATE_RIPPLE.hurry,
          duration: 0.6,
          ease: 'sine.inOut',
          overwrite: true,
        })
      }
      return
    }
    if (index !== shown.current.to) startRef.current(index)
  }, [index, look])

  // The plate bows with the scroll on a damped follow, so it leans into a
  // flick and eases back once the page rests.
  useEffect(() => {
    if (!flex) return
    let value = 0
    let frame = 0
    let then = 0

    const step = (now: number) => {
      // A frame's timestamp can precede the `performance.now()` that queued it.
      const dt = Math.min(Math.max((now - then) / 1000, 0), 0.1)
      then = now
      const goal = Math.tanh(flex.get() / PLATE_RIPPLE.flexSpeed)
      value += (goal - value) * (1 - Math.exp(-dt / PLATE_RIPPLE.flexLag))
      if (Math.abs(goal - value) < 0.0005) value = goal
      const u = materialRef.current?.uniforms
      if (u) {
        u.uFlex.value = value
        invalidate()
      }
      frame = value === goal ? 0 : requestAnimationFrame(step)
    }

    const follow = () => {
      if (frame) return
      then = performance.now()
      frame = requestAnimationFrame(step)
    }

    const unsubscribe = flex.subscribe(follow)
    return () => {
      unsubscribe()
      cancelAnimationFrame(frame)
    }
  }, [flex, invalidate])

  useFrame(() => signalFirstFrame(framesDrawn, onFirstFrame))

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={look === 'ripple' ? RIPPLE_PLANE_ARGS : PLANE_ARGS} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={look === 'ripple' ? PLATE_RIPPLE_VERTEX : PLATE_VERTEX}
        fragmentShader={look === 'ripple' ? PLATE_RIPPLE_FRAGMENT : PLATE_FRAGMENT}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export type PlateFailureReason = 'context' | 'shader' | 'context-lost' | 'media'

export type PlateRuntimeProps = {
  /** The plate frame whose `[data-plate-layer]` pictures the canvas samples. */
  frameRef: RefObject<HTMLElement | null>
  count: number
  index: number
  /** The scroll speed the ripple bows with, in rows per second. */
  flex?: PlateSignal
  look?: PlateLook
  /**
   * How far the canvas reaches past the frame on each side, as a share of
   * the frame, so a look that bends the plate has room to move its edges.
   */
  bleed?: number
  onReady: () => void
  onFailure: (reason: PlateFailureReason) => void
}

/**
 * Waits until every picture in the plate can be sampled, then draws. A
 * picture that fails to load is a failure like a refused context: the owner
 * keeps its DOM pictures. A video that never gets data leaves the canvas
 * unready, which looks the same.
 */
export default function PlateRuntime({
  frameRef,
  count,
  index,
  flex,
  look = 'dither',
  bleed = 0,
  onReady,
  onFailure,
}: PlateRuntimeProps) {
  const { fail, handleCreated, handleError, handleContextLost, handleFirstFrame } =
    useCanvasFailure<PlateFailureReason>(onFailure, 0, onReady)
  const [media, setMedia] = useState<PlateMedia[] | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    const found = frame && plateElements(frame, count)
    if (!found) return fail('media')
    const controller = new AbortController()
    const { signal } = controller
    const sample = async (el: PlateElement) => {
      await whenDrawable(el, signal)
      return el instanceof HTMLVideoElement ? el : stillOf(el)
    }
    Promise.all(found.map(sample)).then(
      (sources) => signal.aborted || setMedia(sources),
      () => signal.aborted || fail('media'),
    )
    return () => controller.abort()
  }, [frameRef, count, fail])

  return (
    <FailureBoundary onError={handleError}>
      <Canvas
        dpr={DPR}
        flat
        frameloop="demand"
        gl={bleed > 0 ? GL_CONFIG_SHAPED : GL_CONFIG}
        linear
        onCreated={handleCreated}
        resize={RESIZE_OPTIONS}
        style={CANVAS_STYLE}
      >
        {media && (
          <PlateScene
            bleed={bleed}
            flex={flex}
            index={index}
            look={look}
            media={media}
            onFirstFrame={handleFirstFrame}
          />
        )}
        <ContextGuard kind="plate" onLost={handleContextLost} />
      </Canvas>
    </FailureBoundary>
  )
}

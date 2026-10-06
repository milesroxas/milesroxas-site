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
import { PLATE_FRAGMENT, PLATE_VERTEX } from './plate-shader'

gsap.registerPlugin(CustomEase)

/**
 * The plate's live layer: one small classic WebGL canvas drawing a single
 * clip-space quad, on demand. It samples the plate's own image and video
 * elements, so nothing downloads twice. It draws while a transition runs and
 * on each new frame of a video it shows; a resting still plate draws nothing.
 */

const { duration, ease } = MORE_WORK_MOTION.plate

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

// Hoisted so JSX never allocates fresh objects per render.
const GL_CONFIG = { alpha: false, antialias: false, powerPreference: 'high-performance' } as const
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 100 } as const
const DPR: [number, number] = [1, 2]
/** R3F writes `pointer-events: auto` on its container; the plate is never a target. */
const CANVAS_STYLE = { pointerEvents: 'none' } as const
const PLANE_ARGS: [number, number] = [2, 2]

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
  onFirstFrame: () => void
}

/**
 * What the transition runs between. `from` is a row's picture, or, when a
 * new row interrupts a transition, a snapshot of the frame as it stood, so
 * the next sweep starts from exactly what was on screen.
 */
type Shown = { from: number | 'snapshot'; to: number }

function PlateScene({ media, index, onFirstFrame }: PlateSceneProps) {
  const size = useThree((state) => state.size)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const materialRef = useRef<ShaderMaterial>(null)
  const framesDrawn = useRef(0)
  const shown = useRef<Shown>({ from: index, to: index })
  const stopVideos = useRef<() => void>(() => {})

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
      uBand: { value: PLATE_LOOK.band },
      uWarp: { value: PLATE_LOOK.warp },
      uCell: { value: PLATE_LOOK.cell },
      uAberration: { value: PLATE_LOOK.aberration },
      uSettle: { value: PLATE_LOOK.settle },
      uDrift: { value: PLATE_LOOK.drift },
    }),
    [textures],
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

  // A new row starts a full transition from whatever is on screen: the
  // picture at rest, or a snapshot when it lands mid-sweep. The sweep runs
  // down the plate when the pointer moved down the list, up when it moved up.
  useEffect(() => {
    const u = materialRef.current?.uniforms
    const state = shown.current
    if (!u || index === state.to) return
    const midway = u.uProgress.value < 1
    const fromTexture = midway ? snapshot() : undefined
    u.uDirection.value = index > state.to ? 1 : -1
    shown.current = { from: midway ? 'snapshot' : state.to, to: index }
    u.uProgress.value = 0
    show(fromTexture)
    const tween = gsap.to(u.uProgress, {
      value: 1,
      duration: PLATE_LOOK.duration,
      ease: PLATE_LOOK.ease,
      onUpdate: invalidate,
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: `show` and `snapshot` read refs; the row is the trigger
  }, [index, invalidate, snapshot, show])

  useFrame(() => signalFirstFrame(framesDrawn, onFirstFrame))

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={PLANE_ARGS} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={PLATE_VERTEX}
        fragmentShader={PLATE_FRAGMENT}
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
        gl={GL_CONFIG}
        linear
        onCreated={handleCreated}
        resize={RESIZE_OPTIONS}
        style={CANVAS_STYLE}
      >
        {media && <PlateScene index={index} media={media} onFirstFrame={handleFirstFrame} />}
        <ContextGuard kind="plate" onLost={handleContextLost} />
      </Canvas>
    </FailureBoundary>
  )
}

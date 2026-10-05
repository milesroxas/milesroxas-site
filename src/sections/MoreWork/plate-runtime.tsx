'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { type ShaderMaterial, Texture, Vector2, VideoTexture } from 'three'
import { FailureBoundary, useCanvasFailure } from '@/features/immersive/ui/failure-boundary'
import { signalFirstFrame } from '@/features/immersive/ui/overlay'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { ContextGuard } from '@/lib/webgl/components/context-guard'
import { PLATE_FRAGMENT, PLATE_VERTEX } from './plate-shader'

gsap.registerPlugin(CustomEase)

/**
 * The plate's live layer: one small classic WebGL canvas drawing a single
 * clip-space quad, on demand. It samples the plate's own image and video
 * elements, so nothing downloads twice. It draws while a dissolve runs and
 * on each new frame of a video it shows; a resting still plate draws nothing.
 */

export const PLATE_DISSOLVE = {
  duration: 0.42,
  ease: CustomEase.create('plate-dissolve', '0.23,1,0.32,1'),
  softness: 0.08,
  edgeWidth: 2,
  edgeScale: 1.06,
  noiseScale: 3,
} as const

// Hoisted so JSX never allocates fresh objects per render.
const GL_CONFIG = { alpha: false, antialias: false, powerPreference: 'high-performance' } as const
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 100 } as const
const DPR: [number, number] = [1, 2]
/** R3F writes `pointer-events: auto` on its container; the plate is never a target. */
const CANVAS_STYLE = { pointerEvents: 'none' } as const
const PLANE_ARGS: [number, number] = [2, 2]

type PlateMedia = HTMLImageElement | HTMLVideoElement

/** The picture in each of the plate's layers, in row order; null if any is missing. */
function plateMedia(frame: HTMLElement, count: number): PlateMedia[] | null {
  const media = Array.from({ length: count }, (_, i) =>
    frame.querySelector<PlateMedia>(`[data-plate-layer="${i}"] :is(img, video)`),
  )
  return media.every(Boolean) ? (media as PlateMedia[]) : null
}

/** Resolves once the element has pixels to sample; an image that fails rejects. */
function whenDrawable(el: PlateMedia, signal: AbortSignal) {
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

const mediaAspect = (el: PlateMedia) =>
  el instanceof HTMLVideoElement
    ? el.videoWidth / el.videoHeight
    : el.naturalWidth / el.naturalHeight

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

function PlateScene({ media, index, onFirstFrame }: PlateSceneProps) {
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const materialRef = useRef<ShaderMaterial>(null)
  const framesDrawn = useRef(0)
  // Which pictures the dissolve runs between; `to` is the one it settles on.
  const shown = useRef({ from: index, to: index })
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

  // Initial values only: runtime updates go through materialRef.
  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[shown.current.from] },
      uTo: { value: textures[shown.current.to] },
      uFromCover: { value: new Vector2(1, 1) },
      uToCover: { value: new Vector2(1, 1) },
      uProgress: { value: 1 },
      uAspect: { value: 1 },
      uSoftness: { value: PLATE_DISSOLVE.softness },
      uEdgeWidth: { value: PLATE_DISSOLVE.edgeWidth },
      uEdgeScale: { value: PLATE_DISSOLVE.edgeScale },
      uNoiseScale: { value: PLATE_DISSOLVE.noiseScale },
    }),
    [textures],
  )

  /** Points the uniforms at `shown` and redraws for as long as a video in it plays. */
  const show = () => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const { from, to } = shown.current
    u.uFrom.value = textures[from]
    u.uTo.value = textures[to]
    coverScale(media[from], u.uAspect.value, u.uFromCover.value)
    coverScale(media[to], u.uAspect.value, u.uToCover.value)
    stopVideos.current()
    const stops = [...new Set([media[from], media[to]])]
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
    show()
    // biome-ignore lint/correctness/useExhaustiveDependencies: `show` reads refs; the size is the trigger
  }, [size.width, size.height, show])

  // A new row mid-dissolve retargets instead of restarting: the picture that
  // fills most of the plate becomes the base, so at most the smaller share
  // of it changes at once, and the progress tween picks up where it is.
  useEffect(() => {
    const u = materialRef.current?.uniforms
    const state = shown.current
    if (!u || index === state.to) return
    if (u.uProgress.value >= 0.5) {
      state.from = state.to
      u.uProgress.value = 0
    }
    state.to = index
    show()
    const tween = gsap.to(u.uProgress, {
      value: 1,
      duration: PLATE_DISSOLVE.duration,
      ease: PLATE_DISSOLVE.ease,
      onUpdate: invalidate,
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: `show` reads refs; the row is the trigger
  }, [index, invalidate, show])

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
    const found = frame && plateMedia(frame, count)
    if (!found) return fail('media')
    const controller = new AbortController()
    Promise.all(found.map((el) => whenDrawable(el, controller.signal))).then(
      () => setMedia(found),
      () => fail('media'),
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

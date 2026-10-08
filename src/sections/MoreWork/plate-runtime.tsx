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
import { MORE_WORK_MOTION } from './motion'
import { PLATE_FRAGMENT, PLATE_VERTEX, PLATE_WAVES } from './plate-shader'
import type { PlateSignal } from './signal'

gsap.registerPlugin(CustomEase)

/**
 * The plate's live layer: one small classic WebGL canvas drawing a fine
 * mesh, on demand. It samples the plate's own image and video elements, so
 * nothing downloads twice. It draws while a wave runs, while the plate bows
 * with the scroll, and on each new frame of a video it shows; a resting still
 * plate draws nothing.
 */

const { plate } = MORE_WORK_MOTION

/** The plate's look (`./plate-shader`): a wave that travels up the plate and bends its frame. Timing is in `./motion`. */
export const PLATE_LOOK = {
  duration: plate.duration / 1000,
  ease: {
    pointer: CustomEase.create('more-work-plate-pointer', plate.ease.pointer.join(',')),
    scroll: CustomEase.create('more-work-plate-scroll', plate.ease.scroll.join(',')),
  },
  /** How much faster a wave runs once another row is waiting, and how long it takes to get there. */
  hurry: plate.hurry,
  hurryRamp: plate.hurryRamp / 1000,
  /** The deepest vertical stretch, as a share of the frame's height. */
  amplitude: 0.014,
  /** How far the sides swell out where the front passes, as a share of the frame's width. */
  swell: 0.01,
  /** Mesh segments each way: enough that the bent edges read as curves. */
  segments: 64,
  /** Wavelengths up the frame: one, so the plate bends in a single broad swell. */
  waves: 1,
  /** How far the slopes lighten and darken the picture. */
  shade: 0.035,
  /** How deep the soft front between the pictures is, as a share of the frame. */
  band: 0.85,
  /** How far the plate bows with the scroll at most, as a share of the frame's height. */
  flex: 0.015,
  /** Scroll speed, in rows per second, that bows it about three quarters of the way. */
  flexSpeed: 6,
  /** Seconds the bow takes to close about two thirds of the way to the scroll's speed. */
  flexLag: 0.3,
} as const

// Hoisted so JSX never allocates fresh objects per render.
/** A bent plate leaves the page showing around it, and its curved edges need smoothing. */
const GL_CONFIG = { alpha: true, antialias: true, powerPreference: 'high-performance' } as const
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 100 } as const
const DPR: [number, number] = [1, 2]
/** R3F writes `pointer-events: auto` on its container; the plate is never a target. */
const CANVAS_STYLE = { pointerEvents: 'none' } as const
const PLANE_ARGS: [number, number, number, number] = [
  2,
  2,
  PLATE_LOOK.segments,
  PLATE_LOOK.segments,
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

/**
 * What leads the plate, and so how it answers. `pointer` (More work) opens
 * each wave fast and starts a row's wave at once, over a running one that
 * quickens to land under it. `scroll` (the dial) opens calmer, and a row that
 * arrives mid-wave waits for the running wave to pass, quickening it.
 */
export type PlateLead = 'pointer' | 'scroll'

type PlateSceneProps = {
  media: PlateMedia[]
  index: number
  flex?: PlateSignal
  bleed: number
  lead: PlateLead
  onFirstFrame: () => void
}

/** One wave carrying `row` over everything below it. */
type Wave = { row: number; direction: number; tween: gsap.core.Tween; state: { progress: number } }

const hurry = (tween: gsap.core.Tween) =>
  gsap.to(tween, {
    timeScale: PLATE_LOOK.hurry,
    duration: PLATE_LOOK.hurryRamp,
    ease: 'sine.inOut',
    overwrite: true,
  })

function PlateScene({ media, index, flex, bleed, lead, onFirstFrame }: PlateSceneProps) {
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const materialRef = useRef<ShaderMaterial>(null)
  const framesDrawn = useRef(0)
  /** The row at rest under every running wave. */
  const base = useRef(index)
  /** Running waves, oldest first. */
  const waves = useRef<Wave[]>([])
  /** The next row, waiting for a wave to pass. */
  const queued = useRef<number | null>(null)
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
      uBase: { value: textures[base.current] as Texture },
      uBaseCover: { value: new Vector2(1, 1) },
      uTex: { value: Array.from({ length: PLATE_WAVES }, () => textures[base.current] as Texture) },
      uCover: { value: Array.from({ length: PLATE_WAVES }, () => new Vector2(1, 1)) },
      uProgress: { value: new Array<number>(PLATE_WAVES).fill(0) },
      uDirection: { value: new Array<number>(PLATE_WAVES).fill(1) },
      uAspect: { value: 1 },
      uBand: { value: PLATE_LOOK.band },
      uAmplitude: { value: PLATE_LOOK.amplitude },
      uWaves: { value: PLATE_LOOK.waves },
      uShade: { value: PLATE_LOOK.shade },
      uSwell: { value: PLATE_LOOK.swell },
      uInset: { value: 1 / (1 + 2 * bleed) },
      uFlex: { value: 0 },
      uFlexDepth: { value: PLATE_LOOK.flex },
    }),
    [textures, bleed],
  )

  /** The row the plate is heading for. */
  const target = () => waves.current.at(-1)?.row ?? base.current

  /** Writes each wave's progress; idle slots sit at 0, where a wave shows nothing. */
  const tick = () => {
    const u = materialRef.current?.uniforms
    if (!u) return
    for (let i = 0; i < PLATE_WAVES; i++) {
      const wave = waves.current[i]
      u.uProgress.value[i] = wave?.state.progress ?? 0
      u.uDirection.value[i] = wave?.direction ?? 1
    }
    invalidate()
  }

  /** Points the uniforms at the base and the waves, and redraws while a video in them plays. */
  const show = () => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const aspect = u.uAspect.value
    u.uBase.value = textures[base.current]
    coverScale(media[base.current], aspect, u.uBaseCover.value)
    for (let i = 0; i < PLATE_WAVES; i++) {
      const row = waves.current[i]?.row ?? base.current
      u.uTex.value[i] = textures[row]
      coverScale(media[row], aspect, u.uCover.value[i])
    }
    stopVideos.current()
    const rows = new Set([base.current, ...waves.current.map((wave) => wave.row)])
    const stops = [...rows]
      .map((row) => media[row])
      .filter((el): el is HTMLVideoElement => el instanceof HTMLVideoElement)
      .map((video) => onVideoFrames(video, invalidate))
    stopVideos.current = () => {
      for (const stop of stops) stop()
    }
    tick()
  }

  useEffect(() => () => stopVideos.current(), [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: `show` reads refs; a new size or material is the trigger
  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uAspect.value = size.width / Math.max(size.height, 1)
    show()
  }, [size.width, size.height, uniforms])

  /** How many waves may run at once. */
  const room = lead === 'pointer' ? PLATE_WAVES : 1

  /**
   * A finished wave shows its picture whole: it becomes the base, and any
   * wave under it is gone from view.
   */
  const land = (wave: Wave) => {
    const at = waves.current.indexOf(wave)
    for (const under of waves.current.slice(0, at)) under.tween.kill()
    waves.current = waves.current.slice(at + 1)
    base.current = wave.row
    const next = queued.current
    queued.current = null
    if (next !== null && next !== target()) start(next)
    else show()
  }

  /**
   * Starts a wave to row `row`: up the plate when the list moved down, down
   * it when the list moved up. Waves already running quicken to land under it.
   */
  const start = (row: number) => {
    for (const under of waves.current) hurry(under.tween)
    const state = { progress: 0 }
    const wave: Wave = {
      row,
      direction: row > target() ? 1 : -1,
      state,
      tween: gsap.to(state, {
        progress: 1,
        duration: PLATE_LOOK.duration,
        ease: PLATE_LOOK.ease[lead],
        onUpdate: tick,
        onComplete: () => landRef.current(wave),
      }),
    }
    waves.current.push(wave)
    show()
  }
  const landRef = useRef(land)
  landRef.current = land
  const startRef = useRef(start)
  startRef.current = start

  useEffect(
    () => () => {
      for (const { tween } of waves.current) {
        // The hurry is a tween on the wave's own tween.
        gsap.killTweensOf(tween)
        tween.kill()
      }
    },
    [],
  )

  // A wave is never cut. A row that arrives while the plate has no room for
  // another wave waits, and the running waves quicken to make way for it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `target` reads refs; the row is the trigger
  useEffect(() => {
    if (index === target()) {
      queued.current = null
      return
    }
    if (waves.current.length >= room) {
      queued.current = index
      for (const wave of waves.current) hurry(wave.tween)
      return
    }
    startRef.current(index)
  }, [index, room])

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
      const goal = Math.tanh(flex.get() / PLATE_LOOK.flexSpeed)
      value += (goal - value) * (1 - Math.exp(-dt / PLATE_LOOK.flexLag))
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
  /** The scroll speed the plate bows with, in rows per second. */
  flex?: PlateSignal
  /**
   * How far the canvas reaches past the frame on each side, as a share of
   * the frame, so the wave has room to move the plate's edges.
   */
  bleed: number
  lead: PlateLead
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
  bleed,
  lead,
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
        {media && (
          <PlateScene
            bleed={bleed}
            flex={flex}
            index={index}
            lead={lead}
            media={media}
            onFirstFrame={handleFirstFrame}
          />
        )}
        <ContextGuard kind="plate" onLost={handleContextLost} />
      </Canvas>
    </FailureBoundary>
  )
}

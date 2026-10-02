'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { CSSProperties, RefObject } from 'react'
import { useMemo, useRef } from 'react'
import { MathUtils, type ShaderMaterial, Vector2, Vector3 } from 'three'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import {
  LIGHT_LEAK_EXCITE_ATTR,
  LIGHT_LEAK_EXCITE_OFF,
  LIGHT_LEAK_EXCITE_SELECTOR,
  LIGHT_LEAK_INTERACTIVE_SELECTOR,
  LIGHT_LEAK_SCOPE_SELECTOR,
} from './light-leak-excite'
import { createFragmentShader, VERTEX_SHADER } from './light-leak-shader'
import {
  isAbsorptive,
  type LeakExciteTargets,
  type LeakMirror,
  type LightLeakProps,
  type LightLeakTuning,
  NO_MIRROR,
} from './light-leak-tuning'
import { mapOverlayPointer, signalFirstFrame } from './overlay'

/**
 * The light leak's scene and its DOM input, apart from any canvas: the page
 * overlay and the visual slot mount it through `./light-leak-runtime`, and the
 * Studio mounts it in an offscreen canvas to render posters.
 */

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
export const LEAK_GL_CONFIG = { antialias: false, powerPreference: 'high-performance' } as const
export const LEAK_RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 200 } as const
/**
 * R3F writes `pointer-events: auto` inline on its container, and a
 * `pointer-events: none` ancestor does NOT stop a descendant that sets `auto`
 * from being a hit target. Left alone, the overlay swallows every wheel and
 * pointer event over the surface it decorates, and because it is a *sibling*
 * of the scroller it covers, those wheel events never reach the scroll
 * container at all. This overrides that inline style.
 */
export const LEAK_CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Clip-space fullscreen quad: the vertex shader bypasses the camera entirely. */
const PLANE_ARGS: [number, number] = [2, 2]
/** Velocity clamp in px/s: a hard flick, past which the response saturates anyway. */
const MAX_SCROLL_VELOCITY = 3000
/** Tab-switch spikes clamp here: a multi-second delta would jump the whole response in one frame. */
const MAX_DELTA = 0.05

/**
 * Smoothed scroll response, carried between frames. One object rather than
 * four refs: it is a single integrator, and every field advances together.
 */
type LeakScrollState = {
  last: number | null
  velocity: number
  energy: number
  phase: number
}

/**
 * One frame of the scroll response: velocity in px/s off whichever scroller
 * drives the overlay, damped, run through the response curve, then folded
 * into the energy the look reads and the phase that slides the field along.
 */
function stepScrollResponse(
  state: LeakScrollState,
  scrollY: number,
  dt: number,
  tuning: LightLeakTuning,
) {
  if (state.last === null) state.last = scrollY
  const raw = MathUtils.clamp(
    (scrollY - state.last) / Math.max(dt, 1 / 240),
    -MAX_SCROLL_VELOCITY,
    MAX_SCROLL_VELOCITY,
  )
  state.last = scrollY

  state.velocity = MathUtils.damp(state.velocity, raw, tuning.scrollDecay, dt)
  const signal = MathUtils.clamp(state.velocity / tuning.scrollSpeed, -1, 1)
  // Response curve, kept signed so scroll direction still drives phase.
  const shaped = Math.sign(signal) * Math.abs(signal) ** tuning.scrollCurve

  state.energy = MathUtils.damp(
    state.energy,
    Math.abs(shaped) * tuning.scrollIntensity,
    tuning.scrollSmooth,
    dt,
  )
  state.phase += shaped * tuning.scrollDrift * dt
}

/**
 * Pointer and hover state, mutated by DOM listeners and read in `useFrame`.
 * A ref rather than state: these change on every pointer event and must never
 * re-render React (perf-never-set-state-in-useframe).
 */
export type LeakInput = {
  clientX: number
  clientY: number
  /** Set by pointermove; makes the frame re-read the overlay rect exactly once. */
  moved: boolean
  /** Overlay-relative pointer, 0..1, y-up (GL convention). */
  x: number
  y: number
  /** 0 at rest, `sectionExcite` across the band, 1 on a target. */
  exciteTarget: number
}

export const createLeakInput = (): LeakInput => ({
  clientX: 0,
  clientY: 0,
  moved: false,
  x: 0.5,
  y: 0.5,
  exciteTarget: 0,
})

/**
 * The band a leak listens inside: the nearest marked scope, else the
 * positioned ancestor the overlay was placed to fill — which is the hero
 * shell, the block's section or the closing band in every shipped placement.
 * `null` means the whole document, the behavior a leak with neither had.
 */
export function leakScopeOf(root: HTMLElement | null): HTMLElement | null {
  const marked = root?.closest<HTMLElement>(LIGHT_LEAK_SCOPE_SELECTOR)
  if (marked) return marked
  const offset = root?.offsetParent
  return offset instanceof HTMLElement ? offset : null
}

export type LeakInputOptions = {
  /** Where hover counts. `null` listens on the document and never reads the band. */
  scope: HTMLElement | null
  targets: LeakExciteTargets
  /** Excitement while the pointer is in the scope but not on a target. */
  section: number
}

/**
 * How excited one hovered element makes the leak. A marker wins over
 * everything, in either direction, so a subtree can be muted inside a band
 * that answers links; then links and buttons where the look asks for them;
 * then the band itself.
 */
function exciteLevelOf(element: Element | null, options: LeakInputOptions): number {
  const { scope, targets, section } = options
  if (!element) return 0
  // A document-wide leak has no band to speak of, so only targets excite it.
  if (!scope) return element.closest(LIGHT_LEAK_EXCITE_SELECTOR) ? 1 : 0
  if (!scope.contains(element)) return 0
  const marked = element.closest(LIGHT_LEAK_EXCITE_SELECTOR)
  if (marked) return marked.getAttribute(LIGHT_LEAK_EXCITE_ATTR) === LIGHT_LEAK_EXCITE_OFF ? 0 : 1
  if (targets === 'interactive' && element.closest(LIGHT_LEAK_INTERACTIVE_SELECTOR)) return 1
  return section
}

/**
 * Listen for the pointer, and for hover inside the leak's band. Overlay-relative
 * mapping happens in `useFrame`; the handlers only record the raw position, so
 * pointermove never touches layout.
 *
 * `pointerover` and `pointerout` are bound to the scope rather than the
 * document: both bubble, so one pair of listeners covers every descendant,
 * including elements mounted long after the leak, and nothing outside the band
 * is ever evaluated.
 */
export function bindLeakInput(input: LeakInput, options: LeakInputOptions): () => void {
  const host: EventTarget = options.scope ?? document
  const onPointerMove = (event: PointerEvent) => {
    input.clientX = event.clientX
    input.clientY = event.clientY
    input.moved = true
  }
  // A tap fires pointerover with no pointerout to answer it, so on touch the
  // flare would simply stay lit — and with a band-wide response, lit over the
  // whole section. Hover is a pointing-device affordance; pen and mouse keep it.
  const hovering = (event: Event) => (event as PointerEvent).pointerType !== 'touch'
  const onPointerOver = (event: Event) => {
    if (hovering(event)) input.exciteTarget = exciteLevelOf(event.target as Element | null, options)
  }
  const onPointerOut = (event: Event) => {
    // Where the pointer is going, not where it was: moving between two
    // children of the band recomputes rather than dropping to rest.
    if (hovering(event))
      input.exciteTarget = exciteLevelOf(
        (event as PointerEvent).relatedTarget as Element | null,
        options,
      )
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  host.addEventListener('pointerover', onPointerOver)
  host.addEventListener('pointerout', onPointerOut)
  return () => {
    window.removeEventListener('pointermove', onPointerMove)
    host.removeEventListener('pointerover', onPointerOver)
    host.removeEventListener('pointerout', onPointerOut)
    input.exciteTarget = 0
  }
}

/** Normalized on the CPU so the fragment stage skips a per-pixel normalize. */
function setDispersionDirection(
  target: Vector2,
  direction: readonly [number, number],
  mirror: LeakMirror,
) {
  const x = mirror[0] ? -direction[0] : direction[0]
  const y = mirror[1] ? -direction[1] : direction[1]
  if (Math.hypot(x, y) > 1e-4) target.set(x, y).normalize()
  else target.set(0.55, 1).normalize()
}

export type LeakSceneProps = {
  rootRef: RefObject<HTMLElement | null>
  inputRef: RefObject<LeakInput>
  scrollSource?: LightLeakProps['scrollSource']
  /** Caller deltas already resolved against `LIGHT_LEAK_DEFAULTS`. */
  tuning: LightLeakTuning
  mirror?: LeakMirror
  /** Signals once, after the first frame's draw has been issued. */
  onFirstFrame?: () => void
  /**
   * Step time by this many seconds per frame instead of the clock, and ignore
   * page scroll. A capture stepped this way draws the same frame every time.
   */
  fixedDelta?: number
}

/** The leak's uniforms at rest. */
function createLeakUniforms() {
  return {
    uT: { value: 0 },
    uPhase: { value: 0 },
    uGrainSeed: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0.5, 0.5) },
    uMirror: { value: new Vector2(0, 0) },
    uWarpAmount: { value: 0 },
    uWarpScale: { value: 1 },
    uMorphAmt: { value: 0 },
    uMorphScale: { value: 1 },
    uDispAmt: { value: 0 },
    uDispDir: { value: new Vector2(0.55, 1).normalize() },
    uGainTotal: { value: 0 },
    uSatTotal: { value: 0 },
    uGrain: { value: 0 },
    uGrainLum: { value: 0 },
    uVignette: { value: 0 },
    uAbsorb: { value: 0 },
    uInkChroma: { value: 1 },
    uInkDensity: { value: 0 },
    uCoolTint: { value: new Vector3(1, 1, 1) },
    uWarmTint: { value: new Vector3(1, 1, 1) },
    uAmber: { value: new Vector3(0, 0, 0) },
    uBlobWarm: { value: 0 },
    uBlobStreak: { value: 0 },
    uStreakAngle: { value: 0 },
    uStreakSpread: { value: 0.1 },
    uBlobCool: { value: 0 },
    uSlats: { value: 0 },
    uSlatAngle: { value: 0 },
    uSlatTopSpread: { value: 0.3 },
    uSlatBottomSpread: { value: 0.3 },
    uSlatRefSpread: { value: 0.3 },
    uSlatFreq: { value: 24 },
    uSlatSharp: { value: 1 },
    uHoverAmt: { value: 0 },
  }
}

type LeakUniforms = ShaderMaterial['uniforms']

/**
 * Resolved values. Every curve that mixes scroll energy (`e`) or hover
 * excitement (`x`) into a parameter is folded here rather than in the shader,
 * so the response math lives in one readable place and the fragment stage
 * does less work.
 */
function writeResponseUniforms(u: LeakUniforms, tuning: LightLeakTuning, e: number, x: number) {
  u.uDispAmt.value = tuning.dispersion + e * tuning.dispersionEnergy + x * tuning.dispersionExcite
  u.uGainTotal.value = tuning.gain + e * tuning.gainEnergy + x * tuning.gainExcite
  u.uSatTotal.value = tuning.saturation + x * tuning.saturationExcite
  u.uSlatFreq.value = tuning.slatFrequency + x * tuning.slatFrequencyExcite
  u.uMorphAmt.value = tuning.morph * e
  u.uHoverAmt.value = x * tuning.hoverBloom
}

/**
 * Static look. Written every frame rather than in a prop-change effect (as the
 * demand-frameloop effects do) because this overlay always animates: a frame
 * is running anyway, and ~20 float writes on it cost nothing next to a
 * 30-entry dependency array.
 */
function writeLookUniforms(u: LeakUniforms, tuning: LightLeakTuning) {
  u.uWarpAmount.value = tuning.warpAmount
  u.uWarpScale.value = tuning.warpScale
  u.uMorphScale.value = tuning.morphScale
  u.uGrain.value = tuning.grain
  u.uGrainLum.value = tuning.grainLuminance
  u.uVignette.value = tuning.vignette
  // Polarity is a uniform rather than a #define on purpose: a theme toggle
  // must not relink the program mid-session (a new material, a compile stall
  // and a dropped frame) when a coherent branch costs nothing.
  u.uAbsorb.value = isAbsorptive(tuning.blendMode) ? 1 : 0
  u.uInkChroma.value = tuning.inkChroma
  u.uInkDensity.value = tuning.inkDensity
  u.uCoolTint.value.fromArray(tuning.coolTint)
  u.uWarmTint.value.fromArray(tuning.warmTint)
  u.uAmber.value.fromArray(tuning.amber)
  u.uBlobWarm.value = tuning.blobWarm
  u.uBlobStreak.value = tuning.streak
  u.uStreakAngle.value = tuning.streakAngle
  u.uStreakSpread.value = tuning.streakSpread
  u.uBlobCool.value = tuning.blobCool
  u.uSlats.value = tuning.slats
  u.uSlatAngle.value = tuning.slatAngle
  u.uSlatTopSpread.value = tuning.slatTopSpread
  u.uSlatBottomSpread.value = tuning.slatBottomSpread
  // Folded here: both ends are uniforms, so the fan's reference width is
  // constant across the draw.
  u.uSlatRefSpread.value = 0.5 * (tuning.slatTopSpread + tuning.slatBottomSpread)
  u.uSlatSharp.value = tuning.slatSharpness
}

/**
 * Ease the pointer uniform toward the input. The pointer is mapped in the
 * element's own box; the field it lands on may be mirrored.
 */
function easePointer(
  u: LeakUniforms,
  input: LeakInput,
  mirror: LeakMirror,
  ease: number,
  dt: number,
) {
  const pointerX = mirror[0] ? 1 - input.x : input.x
  const pointerY = mirror[1] ? 1 - input.y : input.y
  u.uPointer.value.set(
    MathUtils.damp(u.uPointer.value.x, pointerX, ease, dt),
    MathUtils.damp(u.uPointer.value.y, pointerY, ease, dt),
  )
  u.uMirror.value.set(mirror[0] ? 1 : 0, mirror[1] ? 1 : 0)
}

type LeakFrameOptions = Omit<LeakSceneProps, 'mirror'> & {
  materialRef: RefObject<ShaderMaterial | null>
  mirror: LeakMirror
}

/** The leak's frame: integrate time and scroll, ease hover and the pointer, write the uniforms. */
function useLeakFrame(options: LeakFrameOptions) {
  const { materialRef, rootRef, inputRef, scrollSource, tuning, mirror, onFirstFrame, fixedDelta } =
    options
  // Atomic selectors: a bare useThree() re-renders on any R3F state change
  // (perf-zustand-selectors).
  const size = useThree((state) => state.size)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  // Refs, not state: these update every frame.
  const scroll = useRef<LeakScrollState>({ last: null, velocity: 0, energy: 0, phase: 0 })
  const excite = useRef(0)
  // Field time is integrated, never `elapsed * timeScale`: a multiplier that
  // changes while the field runs (the Studio's slider, an editor's speed)
  // would otherwise rescale all the time that has already passed and the
  // field would jump. `elapsed` is the unscaled twin the grain reads.
  const time = useRef({ field: 0, elapsed: 0 })
  const framesDrawn = useRef(0)

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    const dt = Math.min(fixedDelta ?? delta, MAX_DELTA)
    time.current.field += dt * tuning.timeScale
    time.current.elapsed += dt

    // A fixed-step capture has no page under it: the field rests.
    if (fixedDelta === undefined) {
      const element = scrollSource?.current
      stepScrollResponse(scroll.current, element ? element.scrollTop : window.scrollY, dt, tuning)
    }

    // Hover excitement eases in and out slowly, so the flare is a wash.
    const input = inputRef.current
    excite.current = MathUtils.damp(excite.current, input.exciteTarget, tuning.exciteEase, dt)

    mapOverlayPointer(input, rootRef.current)
    easePointer(u, input, mirror, tuning.pointerEase, dt)

    u.uT.value = time.current.field + scroll.current.phase
    u.uPhase.value = scroll.current.phase
    u.uGrainSeed.value = time.current.elapsed
    u.uResolution.value.set(size.width * pixelRatio, size.height * pixelRatio)
    writeResponseUniforms(u, tuning, scroll.current.energy, excite.current)
    setDispersionDirection(u.uDispDir.value, tuning.dispersionDirection, mirror)
    writeLookUniforms(u, tuning)
    signalFirstFrame(framesDrawn, onFirstFrame)
  })
}

export function LeakScene({ mirror = NO_MIRROR, ...props }: LeakSceneProps) {
  const { samples } = props.tuning
  const materialRef = useRef<ShaderMaterial>(null)
  const fragmentShader = useMemo(() => createFragmentShader(samples), [samples])
  // Initial values only: R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(() => createLeakUniforms(), [])
  useLeakFrame({ ...props, materialRef, mirror })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={PLANE_ARGS} />
      {/* Keyed on the shader source: the sample count is a #define, so a new
          tier needs a new program rather than a mutated one. */}
      <shaderMaterial
        key={fragmentShader}
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

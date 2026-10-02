'use client'

import { Canvas } from '@react-three/fiber'
import { type RefObject, useEffect, useMemo, useRef } from 'react'
import { ContextGuard } from '@/lib/webgl/components/context-guard'
import { FailureBoundary, useCanvasFailure } from './failure-boundary'
import {
  bindLeakInput,
  createLeakInput,
  LEAK_CANVAS_STYLE,
  LEAK_GL_CONFIG,
  LEAK_RESIZE_OPTIONS,
  type LeakInput,
  LeakScene,
  leakScopeOf,
} from './light-leak-scene'
import type { LeakMirror, LightLeakProps, LightLeakTuning } from './light-leak-tuning'

/**
 * One live light leak: its own small classic WebGL canvas rather than the
 * global one, because GlobalCanvas prefers WebGPU, where raw GLSL
 * ShaderMaterial is unsupported (WebGPURenderer only accepts TSL node
 * materials). The owner decides whether it may run and how it composites (the
 * blend mode lives on the owner's wrapper, which is the element that meets
 * the backdrop); this draws, listens while it is active, and reports every
 * failure it can observe without retrying.
 */

export type LeakFailureReason = 'context' | 'shader' | 'context-lost'

export type LightLeakRuntimeProps = {
  tuning: LightLeakTuning
  /** Whether frames may run. Off: the context is kept and nothing draws. */
  active: boolean
  /** The element the pointer is mapped into. */
  rootRef: RefObject<HTMLElement | null>
  scrollSource?: LightLeakProps['scrollSource']
  mirror?: LeakMirror
  /** Identity of what this canvas is drawing; readiness reports it back. */
  generation?: number
  onReady?: (generation: number) => void
  onFailure: (reason: LeakFailureReason) => void
}

export function LightLeakRuntime({
  tuning,
  active,
  rootRef,
  scrollSource,
  mirror,
  generation = 0,
  onReady,
  onFailure,
}: LightLeakRuntimeProps) {
  const inputRef = useRef<LeakInput>(createLeakInput())
  const dprRange = useMemo<[number, number]>(() => [1, tuning.dpr], [tuning.dpr])
  const { handleCreated, handleError, handleContextLost, handleFirstFrame } =
    useCanvasFailure<LeakFailureReason>(onFailure, generation, onReady)

  // Hover is read out of the tuning rather than off `tuning` itself: the
  // object is new on every render, and rebinding the band's listeners each
  // time would drop the pointer state mid-hover.
  const { excite, exciteTargets, sectionExcite } = tuning
  useEffect(() => {
    if (!active || !excite) return
    // Resolved on bind, not on render: the band is whatever positioned
    // ancestor the overlay ended up inside, which is only true once laid out.
    return bindLeakInput(inputRef.current, {
      scope: leakScopeOf(rootRef.current),
      targets: exciteTargets,
      section: sectionExcite,
    })
  }, [active, excite, exciteTargets, sectionExcite, rootRef])

  return (
    <FailureBoundary onError={handleError}>
      <Canvas
        dpr={dprRange}
        gl={LEAK_GL_CONFIG}
        frameloop={active ? 'always' : 'never'}
        flat
        linear
        onCreated={handleCreated}
        resize={LEAK_RESIZE_OPTIONS}
        style={LEAK_CANVAS_STYLE}
      >
        <LeakScene
          key={generation}
          inputRef={inputRef}
          mirror={mirror}
          onFirstFrame={handleFirstFrame}
          rootRef={rootRef}
          scrollSource={scrollSource}
          tuning={tuning}
        />
        {/* Census entry plus real loss; R3F's teardown loss never reaches it. */}
        <ContextGuard kind="leak" onLost={handleContextLost} />
      </Canvas>
    </FailureBoundary>
  )
}

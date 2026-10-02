'use client'

import { Component, type ReactNode, useCallback, useRef } from 'react'
import type { WebGLRenderer } from 'three'

/**
 * Turns a render-time throw into a callback and renders nothing after it: a
 * renderer constructor that refuses a context, or a runtime chunk that fails
 * to load from `lazy`. The owner decides what the failure means (a poster, a
 * message); this only makes sure it hears about it once.
 */
export class FailureBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** What every live runtime's canvas can fail with, whatever it draws. */
type CanvasFailureReason = 'context' | 'shader' | 'context-lost'

/**
 * A runtime's failure reporting: the first failure is reported once and no
 * readiness after it. The handlers wire the canvas (`onCreated`), its
 * `FailureBoundary` and its `ContextGuard` to it.
 */
export function useCanvasFailure<Reason extends string>(
  onFailure: (reason: Reason | CanvasFailureReason) => void,
  generation: number,
  onReady?: (generation: number) => void,
) {
  const failed = useRef(false)
  const fail = useCallback(
    (reason: Reason | CanvasFailureReason) => {
      if (failed.current) return
      failed.current = true
      onFailure(reason)
    },
    [onFailure],
  )
  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      // Three reports compile and link failures here instead of throwing;
      // without this hook a broken program draws nothing and looks "ready".
      gl.debug.onShaderError = () => fail('shader')
    },
    [fail],
  )
  const handleError = useCallback(() => fail('context'), [fail])
  const handleContextLost = useCallback(() => fail('context-lost'), [fail])
  const handleFirstFrame = useCallback(() => {
    if (!failed.current) onReady?.(generation)
  }, [generation, onReady])
  return { fail, handleCreated, handleError, handleContextLost, handleFirstFrame }
}

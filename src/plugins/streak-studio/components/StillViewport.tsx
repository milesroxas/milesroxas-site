'use client'

import { useEffect, useRef, useState } from 'react'
import type { EffectId } from '@/features/immersive/studio/effects'
import type { LookGround } from '@/features/immersive/studio/ground'
import { cn } from '@/utilities/ui'
import { captureSerial, isAbort } from './publish'
import { type Shot, shotIdentity } from './shot'

/** How long the stage waits after the last edit before it renders the still again. */
const SETTLE_MS = 350

type Rendered = { url: string; identity: string }

/**
 * The stage, showing a still: the exact pixels the still publishes as,
 * rendered here and shown at its own aspect inside the viewport. It renders
 * again a moment after the last edit that changes it, keeps the last render
 * dimmed while the next one draws, and cancels a render the next edit
 * overtakes. What is on the stage is what Publish files.
 */
export function StillViewport({
  effectId,
  shot,
  ground,
}: {
  effectId: EffectId
  shot: Shot
  ground: LookGround
}) {
  const identity = shotIdentity(shot, ground)
  const [rendered, setRendered] = useState<Rendered | null>(null)
  const [error, setError] = useState('')
  // The effect keys on the identity string; the shot itself is read when it runs.
  const latest = useRef({ shot, ground })
  latest.current = { shot, ground }

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const { shot: current, ground: currentGround } = latest.current
      try {
        const [image] = await captureSerial({
          effect: effectId,
          tuning: current.tuning(current.seed),
          frames: [current.frame],
          // The preview is the still's own pixels at 1x: scale only adds density.
          capture: { ...current.capture, scale: 1 },
          ground: currentGround,
          signal: controller.signal,
        })
        setRendered((previous) => {
          if (previous) URL.revokeObjectURL(previous.url)
          return { url: URL.createObjectURL(image), identity }
        })
        setError('')
      } catch (reason) {
        if (!isAbort(reason)) setError((reason as Error).message)
      }
    }, SETTLE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [effectId, identity])

  useEffect(
    () => () => {
      setRendered((previous) => {
        if (previous) URL.revokeObjectURL(previous.url)
        return null
      })
    },
    [],
  )

  const stale = !rendered || rendered.identity !== identity
  const { width, height } = shot.capture
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      {rendered ? (
        // biome-ignore lint/performance/noImgElement: a render made in this browser, shown from a blob URL
        <img
          src={rendered.url}
          alt=""
          width={width}
          height={height}
          className={cn(
            'max-h-full max-w-full object-contain shadow-[0_0_0_1px_rgb(0_0_0/0.08)] transition-opacity duration-300',
            stale && 'opacity-60',
          )}
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      ) : (
        <div
          aria-hidden
          className="max-h-full max-w-full rounded-sm border border-foreground/10 border-dashed"
          style={{ aspectRatio: `${width} / ${height}`, width: '100%' }}
        />
      )}
      {(stale || error) && (
        <p
          role="status"
          className={cn(
            'pointer-events-none absolute right-3 bottom-3 z-10 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[11px]/3.5 backdrop-blur-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error || 'Rendering…'}
        </p>
      )}
    </div>
  )
}

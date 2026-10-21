'use client'

import { IconDice5 } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { EffectId } from '@/features/immersive/studio/effects'
import type { LookGround } from '@/features/immersive/studio/ground'
import { FRAME_MAX, SEED_MAX } from '@/features/immersive/studio/recipe'
import { cn } from '@/utilities/ui'
import { captureSerial, isAbort } from './publish'
import { type Shot, sheetCapture } from './shot'

/** The moments a sheet offers, across the whole range a capture frame may take. */
const FRAME_LADDER = [15, 45, 90, 150, 225, 300, 450, 600].filter((frame) => frame <= FRAME_MAX)
/** How many arrangements a sheet offers beside the current one. */
const SEED_COUNT = 7
/** A thumbnail's pixels, as a fraction of the still's: enough to read density and layout. */
const THUMB_SCALE = 0.5

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0] & SEED_MAX
const rollSeeds = (current: number) => [current, ...Array.from({ length: SEED_COUNT }, randomSeed)]

type Thumb = { key: number; url: string | null }

/**
 * A contact sheet for the shot on the stage: the same still at other seeds
 * (arrangements) and at other moments of the run (frames), rendered here at a
 * fraction of the still's pixels. Choosing one sets the shot's seed or frame
 * at once; the stage behind renders the exact still. The moments come from
 * one run read back at each frame, so a strip costs one simulation.
 */
export function Variations({
  open,
  onOpenChange,
  effectId,
  shot,
  ground,
  seeded,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  effectId: EffectId
  shot: Shot
  ground: LookGround
  seeded: boolean
  onPick: (next: { seed?: number; frame?: number }) => void
}) {
  const { width, height } = shot.capture
  const aspect = `${width} / ${height}`
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-streak-studio="sheet"
        className="flex max-h-[88svh] flex-col gap-5 overflow-y-auto sm:max-w-4xl"
        // The sheet is portaled out of the stage but not out of its React
        // tree: a key pressed here (Escape to close, Space) is the sheet's
        // own, not the stage's shortcut.
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-[15px]/5">
            Variations of the {shot.label.toLowerCase()}
          </DialogTitle>
          <DialogDescription className="text-xs/5">
            Pick an arrangement or a moment; the stage shows the exact still behind this sheet.
          </DialogDescription>
        </DialogHeader>
        {seeded && (
          <SeedStrip
            open={open}
            effectId={effectId}
            shot={shot}
            ground={ground}
            aspect={aspect}
            onPick={(seed) => onPick({ seed })}
          />
        )}
        <FrameStrip
          open={open}
          effectId={effectId}
          shot={shot}
          ground={ground}
          aspect={aspect}
          onPick={(frame) => onPick({ frame })}
        />
      </DialogContent>
    </Dialog>
  )
}

/** Blob URLs that are let go when a strip renders again or closes. */
function useThumbs() {
  const [thumbs, setThumbs] = useState<Thumb[]>([])
  const replace = useCallback(
    (next: Thumb[]) =>
      setThumbs((previous) => {
        for (const thumb of previous) if (thumb.url) URL.revokeObjectURL(thumb.url)
        return next
      }),
    [],
  )
  useEffect(() => () => replace([]), [replace])
  return [thumbs, replace] as const
}

type StripProps = {
  open: boolean
  effectId: EffectId
  shot: Shot
  ground: LookGround
  aspect: string
}

function SeedStrip({
  open,
  effectId,
  shot,
  ground,
  aspect,
  onPick,
}: StripProps & { onPick: (seed: number) => void }) {
  const [seeds, setSeeds] = useState<number[]>([])
  const [thumbs, setThumbs] = useThumbs()
  const [busy, setBusy] = useState(false)
  const latest = useRef({ shot, ground })
  latest.current = { shot, ground }
  // Everything but the seed: a sheet of seeds is rendered again when the shot
  // under them changes, not when one of them is chosen.
  const identity = JSON.stringify([shot.capture, shot.frame, shot.tuning(0), ground])

  // A fresh roll each time the sheet opens, headed by the seed the shot has then.
  useEffect(() => {
    setSeeds(open ? rollSeeds(latest.current.shot.seed) : [])
  }, [open])

  // biome-ignore lint/correctness/useExhaustiveDependencies: the shot is read through a ref and the run is keyed by its identity, so a render that rebuilds the shot object does not render the sheet again
  useEffect(() => {
    if (!open || !seeds.length) return
    const controller = new AbortController()
    const { shot: current, ground: currentGround } = latest.current
    setThumbs(seeds.map((seed) => ({ key: seed, url: null })))
    setBusy(true)
    ;(async () => {
      const rendered: Thumb[] = []
      try {
        for (const seed of seeds) {
          const [image] = await captureSerial({
            effect: effectId,
            tuning: current.tuning(seed),
            frames: [current.frame],
            capture: sheetCapture(current, THUMB_SCALE),
            ground: currentGround,
            signal: controller.signal,
          })
          rendered.push({ key: seed, url: URL.createObjectURL(image) })
          setThumbs([
            ...rendered,
            ...seeds.slice(rendered.length).map((key) => ({ key, url: null })),
          ])
        }
      } catch (reason) {
        if (!isAbort(reason)) setThumbs(rendered)
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    })()
    return () => controller.abort()
    // The shot's identity stands in for the shot; `seeds` is the strip's own roll.
  }, [open, effectId, identity, seeds, setThumbs])

  return (
    <Strip
      title="Arrangement"
      note="The same look laid out from another seed."
      aspect={aspect}
      thumbs={thumbs}
      current={shot.seed}
      busy={busy}
      label={(seed) => `Seed ${seed}`}
      onPick={onPick}
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => setSeeds(rollSeeds(shot.seed))}
        >
          <IconDice5 aria-hidden />
          Shuffle
        </Button>
      }
    />
  )
}

function FrameStrip({
  open,
  effectId,
  shot,
  ground,
  aspect,
  onPick,
}: StripProps & { onPick: (frame: number) => void }) {
  const [thumbs, setThumbs] = useThumbs()
  const [busy, setBusy] = useState(false)
  const latest = useRef({ shot, ground })
  latest.current = { shot, ground }
  // Everything but the frame, the seed included: another seed is another run.
  const identity = JSON.stringify([shot.capture, shot.tuning(shot.seed), ground])
  const frames = [...new Set([...FRAME_LADDER, shot.frame])].sort((a, b) => a - b)

  // biome-ignore lint/correctness/useExhaustiveDependencies: the shot is read through a ref and the run is keyed by its identity, so a render that rebuilds the shot object does not render the strip again
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const { shot: current, ground: currentGround } = latest.current
    const ladder = [...new Set([...FRAME_LADDER, current.frame])].sort((a, b) => a - b)
    setThumbs(ladder.map((frame) => ({ key: frame, url: null })))
    setBusy(true)
    ;(async () => {
      try {
        const images = await captureSerial({
          effect: effectId,
          tuning: current.tuning(current.seed),
          frames: ladder,
          capture: sheetCapture(current, THUMB_SCALE),
          ground: currentGround,
          signal: controller.signal,
        })
        setThumbs(
          ladder.map((frame, index) => ({ key: frame, url: URL.createObjectURL(images[index]) })),
        )
      } catch (reason) {
        if (!isAbort(reason)) setThumbs([])
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    })()
    return () => controller.abort()
  }, [open, effectId, identity, setThumbs])

  return (
    <Strip
      title="Moment"
      note={`The run at another frame, 1 to ${FRAME_MAX}. ${frames.length} moments.`}
      aspect={aspect}
      thumbs={thumbs}
      current={shot.frame}
      busy={busy}
      label={(frame) => `Frame ${frame}`}
      onPick={onPick}
    />
  )
}

function Strip({
  title,
  note,
  aspect,
  thumbs,
  current,
  busy,
  label,
  onPick,
  action,
}: {
  title: string
  note: string
  aspect: string
  thumbs: Thumb[]
  current: number
  busy: boolean
  label: (key: number) => string
  onPick: (key: number) => void
  action?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <header className="flex items-baseline gap-3">
        <h3 className="font-semibold text-xs/4 tracking-[0.02em]">{title}</h3>
        <p className="min-w-0 flex-1 text-[11px]/4 text-muted-foreground">{note}</p>
        <span className="font-mono text-[11px]/4 text-muted-foreground" aria-live="polite">
          {busy ? 'Rendering…' : ''}
        </span>
        {action}
      </header>
      <ul className="grid grid-cols-4 gap-2">
        {thumbs.map((thumb) => (
          <li key={thumb.key}>
            <button
              type="button"
              aria-pressed={thumb.key === current}
              aria-label={label(thumb.key)}
              disabled={!thumb.url}
              className={cn(
                'pressable flex w-full cursor-pointer flex-col gap-1 rounded-md border p-1 text-left transition-colors hover:bg-muted disabled:cursor-default',
                thumb.key === current ? 'border-primary' : 'border-input',
              )}
              onClick={() => onPick(thumb.key)}
            >
              <span
                className="block w-full overflow-hidden rounded-sm bg-muted"
                style={{ aspectRatio: aspect }}
              >
                {thumb.url && (
                  // biome-ignore lint/performance/noImgElement: a render made in this browser, shown from a blob URL
                  <img src={thumb.url} alt="" className="size-full object-cover" />
                )}
              </span>
              <span className="px-0.5 font-mono text-[11px]/4 text-muted-foreground tabular-nums">
                {label(thumb.key)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

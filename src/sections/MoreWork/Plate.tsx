'use client'

import {
  lazy,
  type RefObject,
  Suspense,
  useCallback,
  useId,
  useState,
  useSyncExternalStore,
} from 'react'
import { Media } from '@/components/Media'
import { FailureBoundary } from '@/features/immersive/ui/failure-boundary'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { useNearViewport } from '@/hooks/use-near-viewport'
import { GPU_PRIORITY } from '@/lib/webgl/gpu-budget'
import { useGpuLease } from '@/lib/webgl/use-gpu-lease'
import { cn } from '@/utilities/ui'
import type { PlateLook } from './plate-runtime'
import type { MoreWorkItem } from './query'
import type { PlateScrub } from './scrub'

const PlateRuntime = lazy(() => import('./plate-runtime'))

/**
 * Where the index shows the plate: wide screens with a hovering pointer.
 * The `plate:` variant in globals.css is the same query for the markup.
 */
export const PLATE_LAYOUT_QUERY = '(min-width: 64rem) and (hover: hover) and (pointer: fine)'

const subscribeLayout = (onChange: () => void) => {
  const query = matchMedia(PLATE_LAYOUT_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export const isPlateLayout = () => matchMedia(PLATE_LAYOUT_QUERY).matches

/**
 * The ripple bends the plate's own edges, so its canvas reaches this share of
 * the frame past each side, past the deepest bend (`PLATE_RIPPLE`).
 */
const RIPPLE_BLEED = 0.08
const RIPPLE_BLEED_STYLE = { inset: `${-RIPPLE_BLEED * 100}%` } as const

const usePlateLayout = () => useSyncExternalStore(subscribeLayout, isPlateLayout, () => false)

/** WebGL samples the plate's own pictures; an SVG has no reliable pixel size to fit. */
const canSample = ({ media }: MoreWorkItem) =>
  Boolean(media?.mimeType && !media.mimeType.includes('svg'))

type Props = {
  items: MoreWorkItem[]
  index: number
  /** A row is opening: the DOM picture under the canvas is the one the morph carries. */
  opening: boolean
  ref: RefObject<HTMLDivElement | null>
  /** Live at every size, not only beside the hover index (`plate:`). */
  always?: boolean
  /** The dissolve follows this position instead of tweening to `index`. */
  scrub?: PlateScrub
  /** The frame's aspect and any other class it needs; 1.6 by default. */
  className?: string
  /** The pictures' `sizes`. */
  size?: string
  /** How the live layer moves between pictures. */
  look?: PlateLook
}

/**
 * The index's one picture. Every work's picture is stacked in the frame and
 * the active one shows, with a slow crossfade: that is the whole plate under
 * reduced motion, without WebGL, or until the live layer is ready. Over it,
 * where the budget admits one, a canvas dissolves from picture to picture
 * (`./plate-runtime`), sampling these same image and video elements, and
 * hides again the moment a row opens, so the view transition carries the
 * DOM picture. The ripple bends the frame itself: its canvas reaches past
 * the frame, and the DOM pictures and ground hide while it draws, so the
 * page shows wherever the plate's edge pulls in.
 */
export function MoreWorkPlate({
  items,
  index,
  opening,
  ref,
  always = false,
  scrub,
  className,
  size = '46vw',
  look,
}: Props) {
  const { hasGPU } = useDeviceDetection()
  const plateLayout = usePlateLayout()
  const near = useNearViewport(ref, '50%', { once: true })
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const handleFailure = useCallback(() => setFailed(true), [])
  const handleReady = useCallback(() => setReady(true), [])

  const id = useId()
  const wanted = hasGPU && (always || plateLayout) && near && !failed && items.every(canSample)
  const live = useGpuLease(id, wanted, 'plate', GPU_PRIORITY.block)
  // A canvas that yields its slot comes back blank: wait for its first frame again.
  if (!live && ready) setReady(false)
  const bleed = look === 'ripple' ? RIPPLE_BLEED : 0
  const drawn = live && ready && !opening
  const shaped = bleed > 0 && drawn

  return (
    <div
      ref={ref}
      className={cn(
        'relative aspect-[1.6] w-full',
        bleed === 0 && 'overflow-clip',
        !shaped && 'bg-muted',
        className,
      )}
      data-slot="more-work-plate"
    >
      {items.map(
        (item, i) =>
          item.media && (
            <div
              key={item.id}
              className={cn(
                'absolute inset-0',
                // Opening swaps at once: the morph carries this picture, not a crossfade.
                !opening && 'transition-opacity duration-(--more-work-swap) ease-[ease]',
                i === index && !shaped ? 'opacity-100' : 'opacity-0',
              )}
              data-plate-layer={i}
            >
              <Media
                crossOrigin="anonymous"
                fill
                htmlElement={null}
                imgClassName="object-cover"
                resource={item.media}
                size={size}
                videoClassName="size-full object-cover"
              />
            </div>
          ),
      )}
      {live && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            drawn ? 'opacity-100' : 'opacity-0',
          )}
          style={bleed > 0 ? RIPPLE_BLEED_STYLE : undefined}
        >
          {/* Also catches the runtime chunk failing to load. */}
          <FailureBoundary onError={handleFailure}>
            <Suspense fallback={null}>
              <PlateRuntime
                bleed={bleed}
                count={items.length}
                frameRef={ref}
                index={index}
                look={look}
                onFailure={handleFailure}
                onReady={handleReady}
                scrub={scrub}
              />
            </Suspense>
          </FailureBoundary>
        </div>
      )}
    </div>
  )
}

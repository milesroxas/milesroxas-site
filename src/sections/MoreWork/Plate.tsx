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
import type { PlateLead } from './plate-runtime'
import type { MoreWorkItem } from './query'
import type { PlateSignal } from './signal'

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
 * The wave bends the plate's own edges, so its canvas reaches this share of
 * the frame past each side, past the deepest bend (`PLATE_LOOK`).
 */
const PLATE_BLEED = 0.05
const PLATE_BLEED_STYLE = { inset: `${-PLATE_BLEED * 100}%` } as const

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
  /** The scroll speed the plate bows with, in rows per second. */
  flex?: PlateSignal
  /** The frame's aspect and any other class it needs; 1.6 by default. */
  className?: string
  /** The pictures' `sizes`. */
  size?: string
  /** What leads the plate: the pointer by default, the scroll for the dial. */
  lead?: PlateLead
}

/**
 * The index's one picture. Every work's picture is stacked in the frame and
 * the active one shows, with a slow crossfade: that is the whole plate under
 * reduced motion, without WebGL, or until the live layer is ready. Over it,
 * where the budget admits one, a canvas runs a wave from picture to picture
 * (`./plate-runtime`), sampling these same image and video elements, and
 * hides again the moment a row opens, so the view transition carries the
 * DOM picture. The wave bends the frame itself: its canvas reaches past the
 * frame, and the DOM pictures and ground hide while it draws, so the page
 * shows wherever the plate's edge pulls in.
 */
export function MoreWorkPlate({
  items,
  index,
  opening,
  ref,
  always = false,
  flex,
  className,
  size = '46vw',
  lead = 'pointer',
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
  const drawn = live && ready && !opening

  return (
    <div
      ref={ref}
      className={cn('relative aspect-[1.6] w-full', !drawn && 'bg-muted', className)}
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
                i === index && !drawn ? 'opacity-100' : 'opacity-0',
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
          style={PLATE_BLEED_STYLE}
        >
          {/* Also catches the runtime chunk failing to load. */}
          <FailureBoundary onError={handleFailure}>
            <Suspense fallback={null}>
              <PlateRuntime
                bleed={PLATE_BLEED}
                count={items.length}
                flex={flex}
                frameRef={ref}
                index={index}
                lead={lead}
                onFailure={handleFailure}
                onReady={handleReady}
              />
            </Suspense>
          </FailureBoundary>
        </div>
      )}
    </div>
  )
}

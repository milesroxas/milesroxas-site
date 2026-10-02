'use client'

import {
  type ComponentType,
  lazy,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utilities/ui'
import type { LeakFailureReason, LightLeakRuntimeProps } from '../ui/light-leak-runtime'
import { type LeakMirror, originMirror } from '../ui/light-leak-tuning'
import { composeLeakTuning } from './compose'
import type { LeakVisualDescriptor, VisualSurface } from './descriptor'
import { useGroundSurface } from './hooks'
import { VISUAL_BLEED_ATTR, VISUAL_HOST_ATTR } from './host'
import type { VisualPlacement } from './placement'
import { frameClass, LiveLayer, VisualPosterStack } from './poster'
import { visualPosters } from './posters'
import { type LiveVisualOptions, liveStatusAttributes, useLiveVisual } from './use-live-visual'

/**
 * The light leak as page media, poster first, on the shared slot lifecycle
 * (`./use-live-visual`).
 *
 * The leak draws an opaque frame and meets its ground through a CSS blend, so
 * it needs a real ground inside its own stacking context: a blend stops at the
 * first ancestor that fades, transforms or clips with a mask, and an opaque
 * frame blended over nothing is a black box. Contained, the frame paints the
 * band's ground and isolates, and the slot's media sits under the leak when
 * the editor asked for it. Bleeding, the layer is portaled onto the block's
 * root (`./host`), which paints the band and isolates while it holds
 * one (globals.css, "Visual bleed"); a slot with no such root stays contained.
 */

const LightLeakRuntime = lazy(() =>
  import('../ui/light-leak-runtime').then((module) => ({ default: module.LightLeakRuntime })),
) as ComponentType<LightLeakRuntimeProps>

type LayerProps = {
  descriptor: LeakVisualDescriptor
  placement: VisualPlacement
  surface: VisualSurface
  priority: boolean
  sizes: string
  active: boolean
  imgClassName?: string
  bleeding: boolean
} & Pick<LiveVisualOptions, 'admission' | 'onStatusChange'>

export type LeakVisualProps = Omit<Partial<LayerProps>, 'bleeding'> &
  Pick<LayerProps, 'descriptor' | 'placement'> & {
    /** Frame classes: aspect ratio, width, corner treatment. */
    className?: string
    /** Fill the nearest positioned ancestor instead of sizing the frame. */
    fill?: boolean
    /** The slot's media, rendered by the owner, shown under the leak when the descriptor carries it. */
    media?: ReactNode
  }

/** Everything that changes what is drawn: a new identity is a new generation. */
const leakIdentity = (descriptor: LeakVisualDescriptor) =>
  `${descriptor.release?.sourceHash ?? descriptor.look}:${descriptor.speed}:${descriptor.intensity}:${descriptor.pointer}:${descriptor.targets}:${descriptor.sectionExcite}:${descriptor.origin}`

/** The stills are rendered with the light entering top right; a mirrored origin flips them. */
const mirrorClass = (mirror: LeakMirror) =>
  cn(mirror[0] && '-scale-x-100', mirror[1] && '-scale-y-100')

type LeakLiveOptions = Pick<
  LayerProps,
  'descriptor' | 'placement' | 'surface' | 'active' | 'admission' | 'onStatusChange'
>

/**
 * The shared slot lifecycle for a leak, the leak's tuning for each ground (the
 * stills composite with each face's blend), and the face for the ground the
 * layer lands on.
 */
function useLeakLive(
  rootRef: RefObject<HTMLDivElement | null>,
  { descriptor, placement, surface, active, admission, onStatusChange }: LeakLiveOptions,
) {
  const lifecycle = useLiveVisual<LeakFailureReason>({
    rootRef,
    placement,
    kind: 'leak',
    allowed: !descriptor.degraded,
    active,
    identity: leakIdentity(descriptor),
    admission,
    onStatusChange,
  })

  const ground = useGroundSurface(rootRef)
  const faces = useMemo(
    () => ({
      dark: composeLeakTuning(descriptor, { surface: 'dark', placement }),
      light: composeLeakTuning(descriptor, { surface: 'light', placement }),
    }),
    [descriptor, placement],
  )
  const tuning = faces[surface === 'auto' ? ground : surface]
  const blend = useMemo(
    () => ({ dark: faces.dark.blendMode, light: faces.light.blendMode }),
    [faces],
  )
  return { ...lifecycle, tuning, blend }
}

function LeakLayer({
  descriptor,
  surface,
  priority,
  sizes,
  imgClassName,
  bleeding,
  ...lifecycle
}: LayerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const posters = useMemo(() => visualPosters({ kind: 'lightLeak', descriptor }), [descriptor])
  const mirror = useMemo(() => originMirror(descriptor.origin), [descriptor.origin])
  const slot = useLeakLive(rootRef, { ...lifecycle, descriptor, surface })

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-visual-layer="lightLeak"
      {...liveStatusAttributes(slot.status, slot.failure)}
      {...(bleeding ? { [VISUAL_BLEED_ATTR]: '' } : {})}
    >
      <VisualPosterStack
        blend={slot.blend}
        imgClassName={cn(mirrorClass(mirror), imgClassName)}
        posters={posters}
        // A bleeding layer is as wide as the page and is never first paint.
        priority={priority && !bleeding}
        shown={!slot.ready}
        sizes={bleeding ? '100vw' : sizes}
        surface={surface}
      />
      {slot.mounted && (
        <LiveLayer
          onError={slot.failChunk}
          ready={slot.ready}
          style={{ mixBlendMode: slot.tuning.blendMode }}
        >
          <LightLeakRuntime
            active={slot.live}
            generation={slot.generation}
            mirror={mirror}
            onFailure={slot.fail}
            onReady={slot.handleReady}
            rootRef={rootRef}
            tuning={slot.tuning}
          />
        </LiveLayer>
      )}
    </div>
  )
}

/**
 * The block root a bleeding leak portals onto, or `null` when it has none.
 * `undefined` until looked for: a bleeding leak never paints contained first.
 */
function useBleedHost(frameRef: RefObject<HTMLElement | null>, bleed: boolean) {
  const [host, setHost] = useState<Element | null | undefined>(undefined)
  useEffect(() => {
    setHost(bleed ? (frameRef.current?.closest(`[${VISUAL_HOST_ATTR}]`) ?? null) : null)
  }, [bleed, frameRef])
  return host
}

export function LeakVisual({
  descriptor,
  surface: landed = 'auto',
  priority = false,
  sizes = '100vw',
  active = true,
  className,
  fill = false,
  media,
  ...layerProps
}: LeakVisualProps) {
  // The editor's pin outranks the ground the slot landed on. A bleeding leak
  // never carries one (`resolveLeakDescriptor`): its band is its ground.
  const surface = descriptor.surface ?? landed
  const frameRef = useRef<HTMLDivElement>(null)
  const host = useBleedHost(frameRef, descriptor.bleed)

  const bleeding = descriptor.bleed && host !== null
  const layer = (
    <LeakLayer
      {...layerProps}
      active={active}
      bleeding={bleeding}
      descriptor={descriptor}
      priority={priority}
      sizes={sizes}
      surface={surface}
    />
  )

  return (
    <div
      ref={frameRef}
      className={cn(
        'overflow-hidden',
        frameClass(fill),
        !bleeding && 'isolate bg-background',
        className,
      )}
      // Pinned, the frame's own ground (`bg-background`) is the pinned palette's.
      data-theme={descriptor.surface ?? undefined}
      data-visual="lightLeak"
      data-visual-look={descriptor.look}
    >
      {descriptor.media && media}
      {bleeding ? host && createPortal(layer, host) : layer}
    </div>
  )
}

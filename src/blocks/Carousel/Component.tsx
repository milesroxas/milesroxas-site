'use client'

import type React from 'react'
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { CarouselBlock as CarouselBlockProps } from '@/payload-types'
import { cursorTarget } from '@/providers/Cursor/variants'
import { cloudflareImageLoader, isCloudflareImageUrl } from '@/utilities/cloudflareImageLoader'
import { cn } from '@/utilities/ui'
import { CarouselFilters } from './filters'
import { useCarouselEffects } from './use-carousel-effects'
import {
  captionOpacity,
  type DeckPose,
  type DeckStyle,
  deckPose,
  restSignedDistance,
  stackCardFraction,
  stackTuck,
} from './visual-state'

type Props = CarouselBlockProps & {
  /** Skip the band when the caller's shell owns it (the Section block). */
  bare?: boolean
  className?: string
  /** How the slides are posed (see ./visual-state). The Carousel block itself is always `coverflow`. */
  deckStyle?: DeckStyle | null
  /** Hands the embla api to a caller that draws its own controls (Carousel tabs' readout). */
  onApi?: (api: CarouselApi) => void
  /** A frame shared with sibling decks, so swapping between them keeps one size (`sharedDeckFrame`). */
  frame?: DeckFrame
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

type Slide = NonNullable<CarouselBlockProps['slides']>[number]
type PopulatedMedia = Exclude<Slide['media'], number | null | undefined>

/**
 * Every size shows one slide plus a sliver of each neighbour on a phone: the
 * sliver is the only affordance a touch carousel has (no arrow gutter, no
 * scrollbar, no hover), so the editor's size choice starts at `md` and a phone
 * is always 1-up. The deck is packed (see ./visual-state), so everything
 * either side of the active slide is neighbour, less the gutter: three
 * quarters lands a ~25px sliver on each edge at 390px.
 */
const MOBILE_PEEK_BASIS = 'basis-3/4'

/**
 * Slide width from `md` up.
 *
 * The pose recesses and blurs the neighbours and the packed deck (see
 * ./visual-state) pulls them in against the active slide, so every pixel
 * outside the active slide is peek, and nobody is reading a peek. The sizes
 * therefore run well above their names. `half` at four fifths leaves a tenth
 * of the column per side to the neighbours. `third` at five twelfths is what
 * three packed slides need to fill the column: the neighbours' outer edges
 * just clip the column edge, so no fourth slide (or its blur halo) leaks in
 * behind them.
 *
 * `third` steps up through the breakpoints rather than jumping straight to
 * three across at 768px, where five twelfths of the column is narrower than
 * the phone slide it replaces.
 */
const slideSizeClasses: Record<NonNullable<CarouselBlockProps['slideSize']>, string> = {
  full: 'md:basis-full',
  half: 'md:basis-4/5',
  third: 'md:basis-5/8 lg:basis-5/12',
}

/**
 * Full-bleed overrides. The window is the column here, so a `half` carousel
 * can spend a quarter of it on the neighbours and still leave a large active
 * slide: five eighths of 1440px is 900px of media, a match for the contained
 * slide at that viewport with twice its peek.
 */
const fullWidthSizeClasses: Partial<Record<NonNullable<CarouselBlockProps['slideSize']>, string>> =
  {
    half: 'md:basis-5/8',
  }

/**
 * Slide gutter, split evenly across both edges (8px + 8px = the same 16px
 * between slides as shadcn's default `-ml-4`/`pl-4`). The default puts the
 * whole gutter on one edge, which under `align: 'center'` pushes the active
 * slide 8px off centre and leaves the right-hand sliver 16px narrower than
 * the left. Halving it makes the peek symmetric; the negative track margin
 * still cancels the outer padding, so the first slide stays flush with the
 * page column.
 *
 * `half` runs 12px instead of 16px: with one big slide carrying the frame,
 * every pixel of gutter comes straight off the media, and the recessed
 * neighbours already read as separate without the extra air.
 */
const slideGutterClasses: Record<
  NonNullable<CarouselBlockProps['slideSize']>,
  { slide: string; track: string }
> = {
  full: { slide: 'px-2', track: '-mx-2' },
  half: { slide: 'px-1.5', track: '-mx-1.5' },
  third: { slide: 'px-2', track: '-mx-2' },
}

// Depth-starved queries leave uploads as ids; skip those slides up front so
// render indexes stay aligned with embla's snap indexes.
const renderableSlidesOf = (slides: CarouselBlockProps['slides']): Slide[] =>
  (slides ?? []).filter((slide) => slide.media && typeof slide.media === 'object')

/**
 * Viewport-height cap on the slide width.
 *
 * Every size above is a fraction of the column, so the slide's height is
 * whatever its media's aspect ratio makes of that width: a portrait deck at
 * four fifths of a desktop column runs taller than the window. The cap is the
 * width at which the deck's tallest media reaches 70svh, published per deck
 * as `--carousel-slide-aspect` (see `tallestAspectRatio`), so no slide is ever
 * taller than that. The other 30svh holds the header, the caption and a
 * margin of page around the slide.
 *
 * It caps every slide by the same width, not each by its own media: the deck
 * stays uniform, which the packed pose (see ./visual-state) and the tween's
 * snap spacing (see ./geometry) both assume. Landscape media in a portrait
 * deck simply run shorter, centred by `items-center` on the track. Below the
 * cap the width fraction still wins, so a landscape deck is untouched until
 * the window is short enough to need it.
 */
const SLIDE_HEIGHT_CAP = 'max-w-[calc(70svh*var(--carousel-slide-aspect))]'

/**
 * Width over height of the deck's tallest media, or undefined when no slide
 * carries dimensions (an upload processed without them), in which case the
 * deck runs uncapped rather than against a guessed ratio.
 */
const tallestAspectRatio = (slides: Slide[]): number | undefined => {
  let tallest: number | undefined
  for (const slide of slides) {
    const { height, width } = slide.media as PopulatedMedia
    if (!width || !height) continue
    const aspect = width / height
    if (tallest === undefined || aspect < tallest) tallest = aspect
  }
  return tallest
}

/**
 * One frame for several decks (Carousel tabs), so a swap never changes the
 * block's height. `aspect` replaces each deck's own in the height cap, so
 * every deck's slide is one width; `height` is the tallest picture any deck
 * draws, in slide widths (a stack card is narrower than its slide by the
 * fan); `caption` reserves a caption line when any slide carries one.
 */
export type DeckFrame = { aspect: number; caption: boolean; height: number }

export const sharedDeckFrame = (
  decks: CarouselBlockProps['slides'][],
  deckStyle?: DeckStyle | null,
): DeckFrame | undefined => {
  let aspect: number | undefined
  let caption = false
  let height = 0
  for (const deck of decks) {
    const slides = renderableSlidesOf(deck)
    caption ||= slides.some((slide) => slide.caption)
    const tallest = tallestAspectRatio(slides)
    if (tallest === undefined) continue
    aspect = Math.min(aspect ?? tallest, tallest)
    const card = deckStyle === 'stack' ? stackCardFraction(slides.length) : 1
    height = Math.max(height, card / tallest)
  }
  return aspect === undefined ? undefined : { aspect, caption, height }
}

/** The caption's `mt-4` and one `text-sm` line. */
const CAPTION_RESERVE = '2.25rem'

/**
 * Every slide in a framed deck stands on the frame's foot, so a shorter deck
 * keeps its bottom edge on the controls beside it (see Carousel tabs). `cqw`
 * is the slide's width: the item is a size container.
 */
const frameStyle = (frame: DeckFrame): CSSProperties => ({
  minHeight: `calc(${frame.height.toFixed(4)} * 100cqw${frame.caption ? ` + ${CAPTION_RESERVE}` : ''})`,
})

/**
 * The stack pins every slide into one slot (see `stackVisualState`), so the
 * slide is the whole column at every breakpoint: a phone needs no sliver,
 * the pile is the affordance. No gutter either: the pin counts slide widths,
 * and a gutter would put every board a few pixels off the one above it.
 */
const STACK_LAYOUT = {
  // Nothing in the stack's frame takes the pointer but the visible cards (see
  // `interactive` in ./visual-state): the track is unclipped and embla slides
  // it left, over the copy column, and every slide spans the whole slot, so
  // the top one's empty strip would sit over the pile. Drags still reach
  // embla: they bubble up from the card.
  gutter: { slide: 'px-0', track: 'pointer-events-none mx-0' },
  size: 'pointer-events-none basis-full',
}

/**
 * The stack's card: narrower than its slide by the fan, anchored at its left
 * edge so only the right edges step out. The width is the fraction the pose
 * divides by, so the two cannot drift.
 */
const stackCardStyle = (count: number): CSSProperties => ({
  width: `${stackCardFraction(count) * 100}%`,
})

/**
 * A board resting on the band: a hairline in the band's own ink so it holds
 * its edge on any theme, a tight contact shadow, and a wide soft one that
 * lifts it off the surface. Layered rather than one heavy blur, which reads
 * as a smudge under a light board.
 *
 * Hover fans the pile out by its published `--stack-depth` (the top board
 * has none, so it stays put) to say the boards come apart; press settles the
 * board a hair, the same 1.5% a grabbed card gives. Both ride the `translate`
 * and `scale` properties, so they compose with the per-frame `transform` on
 * the card rather than fighting it.
 */
const STACK_MEDIA_CLASS = cn(
  'rounded-lg ring-1 ring-foreground/[0.06]',
  'shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_16px_-6px_rgb(0_0_0/0.08),0_28px_56px_-20px_rgb(0_0_0/0.22)]',
  'transition-[translate,scale] duration-300 ease-(--ease-out-quint) motion-reduce:transition-none',
  'group-hover/deck:translate-x-[calc(var(--stack-depth,0)*0.75rem)]',
  'active:scale-[0.985] active:duration-150',
)

/**
 * The pile deals itself out once it is in view: every board behind the top
 * card starts tucked under it (`stackTuck`) and slides out to its peek, the
 * nearest first, on the slower pacing the site's media reveals keep. Only
 * `translate`, on the frame inside the card, so nothing reflows and it
 * composes with the per-frame pose. Once per mount, so a tab swap deals the
 * new deck once it shows (the swap holds the panel clipped until then).
 * Reduced motion starts dealt.
 */
const STACK_DEAL = { delay: 220, stagger: 180, duration: 1100 } as const
const STACK_DEAL_DEPTH = 2
const STACK_DEAL_MARGIN = '0px 0px -20% 0px'

type Deal = 'tucked' | 'dealing' | 'dealt'

const useStackDeal = (isStack: boolean) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [deal, setDeal] = useState<Deal>(isStack ? 'tucked' : 'dealt')

  useEffect(() => {
    if (deal !== 'tucked') return
    if (reduced) {
      setDeal('dealt')
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setDeal('dealing')
      },
      { rootMargin: STACK_DEAL_MARGIN },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [deal, reduced])

  useEffect(() => {
    if (deal !== 'dealing') return
    const { delay, duration, stagger } = STACK_DEAL
    const timer = setTimeout(
      () => setDeal('dealt'),
      delay + stagger * (STACK_DEAL_DEPTH - 1) + duration,
    )
    return () => clearTimeout(timer)
  }, [deal])

  return { deal, ref }
}

const dealStyle = (deal: Deal, depth = 0): CSSProperties | undefined => {
  if (depth === 0 || deal === 'dealt') return undefined
  if (deal === 'tucked') return { translate: `${(stackTuck(depth) * 100).toFixed(2)}% 0` }
  const { delay, duration, stagger } = STACK_DEAL
  return {
    transition: `translate ${duration}ms var(--ease-out-quint) ${delay + (depth - 1) * stagger}ms`,
  }
}

/** The veil is the band's surface, so a receding board fades into whatever band holds it. */
const STACK_VEIL: Record<NonNullable<CarouselBlockProps['theme']>, string> = {
  default: 'bg-background',
  inverted: 'bg-background',
  neutral: 'bg-neutral',
  brand: 'bg-brand',
}

/** Slide and track classes for one deck, from its style, size, width and media. */
const deckLayout = (
  slides: Slide[],
  slideSize: CarouselBlockProps['slideSize'],
  isFullWidth: boolean,
  isStack: boolean,
  frame?: DeckFrame,
) => {
  const size = slideSize ?? 'full'
  const slideAspect = frame?.aspect ?? tallestAspectRatio(slides)
  const sizeClass = cn(
    isStack
      ? STACK_LAYOUT.size
      : cn(
          MOBILE_PEEK_BASIS,
          (isFullWidth && fullWidthSizeClasses[size]) || slideSizeClasses[size],
        ),
    slideAspect !== undefined && SLIDE_HEIGHT_CAP,
  )
  // A corner radius reads as a card edge, which needs room around it. A slide
  // that runs the whole window has none, and the curve gets cut off against
  // the browser edge, so it squares off. Only a full-width block with
  // full-width slides can span the window, and even then only when the
  // height cap isn't holding it in from the edges, so the slide asks its own
  // width (the item is a size container): a slide within a scrollbar's width
  // of the window squares off, one inset any further keeps its corners. Below
  // `md` the slide is always peeking, inset on both sides, and the query never
  // matches.
  const cornerClass = cn(
    'rounded-lg',
    isFullWidth && size === 'full' && !isStack && '@min-[calc(100vw-1.5rem)]:rounded-none',
  )

  // Media may bleed; captions stay on the page column. Only a full-width slide leaves it (from `md`).
  const captionClassName = isFullWidth && size === 'full' && !isStack ? 'md:container' : undefined

  const trackStyle =
    slideAspect !== undefined
      ? ({ '--carousel-slide-aspect': slideAspect.toFixed(4) } as CSSProperties)
      : undefined

  const gutter = isStack ? STACK_LAYOUT.gutter : slideGutterClasses[size]
  return { captionClassName, cornerClass, gutter, sizeClass, trackStyle }
}

/**
 * A picture still loading shows a blurred 32px copy of itself on a muted
 * plate, then comes into focus as the full picture fades over it. One the
 * browser already holds (a deck shown before) is there at once. Cloudflare
 * resizes the copy; any other source keeps the plate alone.
 */
const PLATE_CLEAR = 'transition-opacity delay-900 duration-300'

const placeholderOf = (media: PopulatedMedia) => {
  const src = media.cloudflareImageUrl
  return src && isCloudflareImageUrl(src)
    ? cloudflareImageLoader({ src, width: 32, quality: 40 })
    : undefined
}

const PicturePlate: React.FC<{ cornerClass: string; loaded: boolean; src?: string }> = ({
  cornerClass,
  loaded,
  src,
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'absolute inset-0 overflow-clip bg-foreground/[0.06]',
      cornerClass,
      PLATE_CLEAR,
      loaded && 'opacity-0',
    )}
  >
    {src && (
      // biome-ignore lint/performance/noImgElement: a 32px Cloudflare copy, blurred up to the frame
      <img alt="" className="size-full scale-110 object-cover blur-xl" decoding="async" src={src} />
    )}
  </div>
)

type PictureState = 'loading' | 'loaded' | 'held'

/** `relative` lifts the picture over the plate, which is positioned. */
const PICTURE_CLASS: Record<PictureState, string> = {
  loading: 'relative block opacity-0',
  loaded: 'relative block transition-opacity duration-900 ease-[ease]',
  held: 'relative block',
}

const usePictureState = (isImage: boolean) => {
  const frameRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PictureState>(isImage ? 'loading' : 'held')
  useLayoutEffect(() => {
    const img = frameRef.current?.querySelector<HTMLImageElement>('picture img')
    if (img?.complete && img.naturalWidth > 0) setState('held')
  }, [])
  const onLoad = useCallback(() => setState((now) => (now === 'loading' ? 'loaded' : now)), [])
  return { frameRef, onLoad, state }
}

const CarouselSlide: React.FC<{
  captionClassName?: string
  cornerClass: string
  deal: Deal
  frame?: DeckFrame
  gutterClass: string
  isStack: boolean
  count: number
  pose: DeckPose
  restSigned: number
  sizeClass: string
  slide: Slide
  veilClass?: string
}> = ({
  captionClassName,
  cornerClass,
  count,
  deal,
  frame,
  gutterClass,
  isStack,
  pose,
  restSigned,
  sizeClass,
  slide,
  veilClass,
}) => {
  const media = slide.media as PopulatedMedia
  // sas-site's Media carries a generated `poster` upload; here a video's still
  // is its Cloudflare Stream thumbnail, the one VideoMedia already paints.
  const isVideo = Boolean(media.mimeType?.includes('video'))
  const posterSrc = isVideo ? media.cloudflareStreamThumbnailUrl : null
  const picture = usePictureState(!isVideo)
  const rest = pose(restSigned, count)
  return (
    <CarouselItem
      className={cn('@container', gutterClass, sizeClass)}
      style={rest.zIndex === undefined ? undefined : { zIndex: rest.zIndex }}
    >
      {/* First child is the tween target. Server-rendered rest-state styles
          match the tween's frame 0, so hydration never flickers. */}
      <div
        className={cn(
          'will-change-slide',
          isStack && 'origin-left',
          frame && 'flex flex-col justify-end',
        )}
        style={{
          ...(isStack && stackCardStyle(count)),
          ...(frame && frameStyle(frame)),
          ...(rest.depth !== undefined && { '--stack-depth': rest.depth }),
          ...(rest.interactive !== undefined && {
            pointerEvents: rest.interactive ? 'auto' : 'none',
          }),
          filter: rest.filter,
          opacity: rest.opacity,
          transform: rest.transform,
        }}
      >
        <div
          // A board is opaque: until its picture lands, the band's surface
          // keeps the boards tucked under it from showing through.
          className={cn('relative', isStack && STACK_MEDIA_CLASS, veilClass)}
          data-carousel-frame
          ref={picture.frameRef}
          style={dealStyle(deal, rest.depth)}
        >
          {picture.state !== 'held' && (
            <PicturePlate
              cornerClass={cornerClass}
              loaded={picture.state === 'loaded'}
              src={placeholderOf(media)}
            />
          )}
          {/* Playback is gated by useCarouselEffects: only the active slide plays.
              `w-full`: a source narrower than the slide would otherwise sit at
              its natural width inside the plate, which fills the slide. */}
          <Media
            autoPlay={false}
            imgClassName={cn(cornerClass, 'w-full')}
            onLoad={picture.onLoad}
            pictureClassName={PICTURE_CLASS[picture.state]}
            resource={slide.media}
            videoClassName={cn(cornerClass, 'w-full')}
          />
          {posterSrc && (
            // Poster sits over the paused video and melts away through the
            // dissolve filter when the slide activates.
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              data-carousel-poster
            >
              {/* biome-ignore lint/performance/noImgElement: a Stream thumbnail URL, already sized by Cloudflare */}
              <img alt="" className={cn(cornerClass, 'size-full object-cover')} src={posterSrc} />
            </div>
          )}
          {veilClass && (
            <div
              aria-hidden="true"
              className={cn('pointer-events-none absolute inset-0 rounded-lg', veilClass)}
              data-carousel-veil
              style={{ opacity: rest.veil ?? 0 }}
            />
          )}
        </div>
        {slide.caption && (
          // Only the active slide carries ink; the fade is written by the same
          // per-frame writer as the pose (see ./use-carousel-effects), and this
          // rest-state opacity is that writer's frame 0.
          <p
            className={cn('mt-4 text-sm text-muted-foreground', captionClassName)}
            data-carousel-caption
            style={{ opacity: captionOpacity(restSigned) }}
          >
            {slide.caption}
          </p>
        )}
      </div>
    </CarouselItem>
  )
}

/**
 * Below `md` the arrows overlay the slides in both widths: reserving an outer
 * gutter for them there would spend a quarter of a phone's column on chrome.
 * From `md` the contained width moves them back outside the slides.
 *
 * `::after` pads the 24px control out to a 48px touch target on touch-sized
 * screens without changing how it looks. `md:after:hidden` drops the pad once
 * the pointer is fine, so it can't swallow hover on the slide behind it.
 */
const ARROW_TOUCH_TARGET = 'z-10 after:absolute after:-inset-3 md:after:hidden'

/**
 * An overlaid arrow sits on the media, where the outline variant's transparent
 * fill leaves the chevron unreadable over a dark frame. A translucent surface
 * of the current theme restores the contrast without hiding the slide.
 */
const ARROW_OVERLAY = 'bg-background/80 backdrop-blur-xs dark:bg-background/80'
/** Contained arrows clear the slides at `md`, so the surface comes back off. */
const ARROW_CONTAINED_MD = 'md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent'

const CarouselArrows: React.FC<{ isFullWidth: boolean }> = ({ isFullWidth }) => (
  <>
    <CarouselPrevious
      className={cn(
        'left-4',
        ARROW_TOUCH_TARGET,
        ARROW_OVERLAY,
        !isFullWidth && `md:-left-12 ${ARROW_CONTAINED_MD}`,
      )}
    />
    <CarouselNext
      className={cn(
        'right-4',
        ARROW_TOUCH_TARGET,
        ARROW_OVERLAY,
        !isFullWidth && `md:-right-12 ${ARROW_CONTAINED_MD}`,
      )}
    />
  </>
)

const CAROUSEL_OPTS: React.ComponentProps<typeof Carousel>['opts'] = {
  loop: true,
  // The pose in ./visual-state is symmetric about the active slide,
  // so the track is centred at every size: the active slide sits in
  // the middle with an equal sliver of each neighbour. At
  // `basis-full` this is identical to `start` — the slide is the
  // column — so one rule covers every size.
  align: 'center',
  // Embla drops `loop` when the deck can't fill the window (a short deck on
  // a wide screen). Trimmed snaps would then pin the first slide to the left
  // edge and break the even snap spacing ./geometry assumes, so every snap
  // stays centred, and the deck opens on its middle one (`openingSnap`).
  containScroll: false,
}

/**
 * The stack starts its slot on the column's left edge: the pile fans right,
 * so a height-capped slide narrower than the column keeps the top board on
 * the grid line and spends the leftover width on the fan side. Its snaps
 * settle slower than embla's default (25): the pile moving up a board is the
 * whole show, so it should land, not jump. The start is still immediate.
 */
const STACK_OPTS: React.ComponentProps<typeof Carousel>['opts'] = {
  loop: true,
  align: 'start',
  duration: 40,
}

/** The embla api, plus the SVG filter ids and nodes the per-frame effects write through. */
const useDeckEffects = (deckStyle: DeckStyle) => {
  const [api, setApi] = useState<CarouselApi>()
  const filterIdBase = useId()
  const caId = `${filterIdBase}-ca`
  const dissolveId = `${filterIdBase}-dissolve`
  const caOffsets = useRef<{ red: SVGFEOffsetElement | null; blue: SVGFEOffsetElement | null }>({
    red: null,
    blue: null,
  })
  const dissolveMap = useRef<SVGFEDisplacementMapElement | null>(null)
  useCarouselEffects({
    api,
    caId,
    caOffsets,
    dissolveId,
    dissolveMap,
    stacked: deckStyle === 'stack',
    pose: deckPose[deckStyle],
  })
  return { caId, caOffsets, dissolveId, dissolveMap, setApi }
}

export const CarouselBlock: React.FC<Props> = (props) => {
  const {
    bare,
    className,
    deckStyle,
    enableGutter = true,
    frame,
    onApi,
    showArrows,
    slides,
    slideSize,
    theme,
    width,
  } = props

  const style: DeckStyle = deckStyle === 'stack' ? 'stack' : 'coverflow'
  const isStack = style === 'stack'
  const { caId, caOffsets, dissolveId, dissolveMap, setApi } = useDeckEffects(style)
  const stackDeal = useStackDeal(isStack)
  const handleApi = useCallback(
    (api: CarouselApi) => {
      setApi(api)
      onApi?.(api)
    },
    [onApi, setApi],
  )
  // A tab switch unmounts this deck; the caller must not keep driving its destroyed api.
  useEffect(() => () => onApi?.(undefined), [onApi])

  const renderableSlides = renderableSlidesOf(slides)

  if (!renderableSlides.length) return null

  const isFullWidth = width === 'full-width'
  const { captionClassName, cornerClass, gutter, sizeClass, trackStyle } = deckLayout(
    renderableSlides,
    slideSize,
    isFullWidth,
    isStack,
    frame,
  )

  return (
    <Section bare={bare} spacing="loose" theme={theme}>
      {/* The custom cursor's Drag ring: the pointer says what the deck does. */}
      <div
        className={cn({ container: enableGutter && !isFullWidth }, className)}
        ref={stackDeal.ref}
        {...cursorTarget('drag')}
      >
        <CarouselFilters
          caId={caId}
          caOffsets={caOffsets}
          dissolveId={dissolveId}
          dissolveMap={dissolveMap}
        />
        {/* Only the md+ contained layout reserves outer gutter room for the arrows. */}
        <Carousel
          className={cn(showArrows && !isFullWidth && 'md:mx-12', isStack && 'group/deck')}
          opts={isStack ? STACK_OPTS : CAROUSEL_OPTS}
          setApi={handleApi}
        >
          {/* items-center: slides keep their media's natural aspect ratio, so shorter slides align to the vertical middle of the tallest. */}
          {/* A stack pins every board into the slot, so nothing needs clipping, and
              clipping would cut the leaving board and the shadows off flat. */}
          <CarouselContent
            className={cn(gutter.track, 'items-center')}
            style={trackStyle}
            viewportClassName={isStack ? 'overflow-visible' : undefined}
          >
            {renderableSlides.map((slide, index) => (
              <CarouselSlide
                captionClassName={captionClassName}
                cornerClass={cornerClass}
                count={renderableSlides.length}
                deal={stackDeal.deal}
                frame={frame}
                gutterClass={gutter.slide}
                isStack={isStack}
                key={slide.id}
                pose={deckPose[style]}
                // Before embla mounts nothing is looped, so a stack slide sits
                // where it was laid out: `index` slides along.
                restSigned={isStack ? index : restSignedDistance(index, renderableSlides.length)}
                sizeClass={sizeClass}
                slide={slide}
                veilClass={isStack ? STACK_VEIL[theme ?? 'default'] : undefined}
              />
            ))}
          </CarouselContent>
          {showArrows && <CarouselArrows isFullWidth={isFullWidth} />}
        </Carousel>
      </div>
    </Section>
  )
}

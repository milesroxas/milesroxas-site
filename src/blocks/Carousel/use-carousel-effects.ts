'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { CarouselApi } from '@/components/ui/carousel'
import type { CaOffsets, DissolveMap } from './filters'
import { computeTweenFactor, forEachSnapDistance } from './geometry'
import { collectSlideRefs, createPlaybackController, type SlideRefs } from './playback'
import { captionOpacity, clamp, type DeckPose, type SlideVisualState } from './visual-state'

gsap.registerPlugin(useGSAP)

/** Chromatic aberration: px of RGB split per unit of embla scroll velocity, and its cap. */
const CA_VELOCITY_SCALE = 0.12
const CA_MAX_PX = 1.5
/** Below this the split is invisible; snap dx to 0 so settled frames are pixel-identical. */
const CA_MIN_PX = 0.05

const identity = (signed: number): number => signed

/**
 * One frame of a slide's pose, written straight to its nodes. Direct style
 * writes: GSAP's transform cache swallows raw transform strings pushed
 * through quickSetter.
 */
const writeSlide = (refs: SlideRefs, state: SlideVisualState) => {
  const { node } = refs
  node.style.transform = state.transform
  node.style.opacity = String(state.opacity)
  node.style.filter = state.filter
  // Paint order belongs to the embla slide (the flex item), not the target:
  // loop points transform the slide, which traps any z-index set below it.
  if (state.zIndex !== undefined && node.parentElement) {
    node.parentElement.style.zIndex = String(state.zIndex)
  }
  if (state.depth !== undefined) node.style.setProperty('--stack-depth', String(state.depth))
  if (refs.veil && state.veil !== undefined) refs.veil.style.opacity = String(state.veil)
  if (state.interactive !== undefined)
    node.style.pointerEvents = state.interactive ? 'auto' : 'none'
}

type Options = {
  api: CarouselApi
  caId: string
  caOffsets: CaOffsets
  dissolveId: string
  dissolveMap: DissolveMap
  /** The deck's pose (see ./visual-state); the server render uses the same one. */
  pose: DeckPose
  /** A tap on the stack's pile deals the next board. */
  stacked?: boolean
}

/**
 * All runtime behavior for the carousel, in one GSAP context, derived from a
 * single value per slide: its signed snap distance (see ./geometry), mapped
 * through the deck's pose (see ./visual-state) and written straight to the node. The one source
 * of truth is embla's scroll position — there is no intermediate animation
 * state, so the visuals can never lag, race, or disagree with it:
 *
 * - `scroll` fires every frame embla moves (drag follows the pointer 1:1;
 *   arrows ride embla's own spring), and each frame is a pure function of
 *   scroll position.
 * - `settle` writes the same value rounded to the whole snap embla rests on,
 *   because it can stop a hair off-snap; the active slide always ends
 *   dead-flat facing the viewer. Same source, same math — no second writer.
 *   Settle also drives playback and posters (see ./playback).
 *
 * The chromatic-aberration tear rides scroll velocity through a gsap.quickTo
 * envelope driving only the feOffset dx values. The SVG filter itself stays
 * attached to the track permanently: at dx 0 the channel split recombines to
 * the identity image, and never toggling `filter` means the compositor never
 * rebuilds the subtree's layers (toggling it flashed the slides' own
 * opacity/filter for a frame at drag start).
 */
export const useCarouselEffects = ({
  api,
  caId,
  caOffsets,
  dissolveId,
  dissolveMap,
  pose,
  stacked = false,
}: Options) => {
  useGSAP(
    (_context, contextSafe) => {
      if (!api || !contextSafe) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const trackNode = api.containerNode()

      let tweenFactor = 1
      let slideRefs: (SlideRefs | null)[] = []

      const applySlide = (refs: SlideRefs, signed: number) => {
        writeSlide(refs, pose(signed, slideRefs.length))
        // Caption rides the same value on its own steeper ramp, so it is one
        // more pure write per frame rather than a second animation.
        if (refs.caption) refs.caption.style.opacity = String(captionOpacity(signed))
      }

      /** Paint every slide from the current scroll position, posing via `poseOf`. */
      const paintSlides = (poseOf: (signed: number) => number) => {
        forEachSnapDistance(
          api.internalEngine(),
          api.scrollSnapList(),
          api.scrollProgress(),
          tweenFactor,
          (slideIndex, signed) => {
            const refs = slideRefs[slideIndex]
            if (refs) applySlide(refs, poseOf(signed))
          },
        )
      }

      // --- Chromatic aberration envelope -----------------------------------
      const caProxy = { px: 0 }
      const applyCa = () => {
        const px = Math.abs(caProxy.px) < CA_MIN_PX ? 0 : caProxy.px
        caOffsets.current.red?.setAttribute('dx', String(px))
        caOffsets.current.blue?.setAttribute('dx', String(-px))
      }
      const caTo = gsap.quickTo(caProxy, 'px', {
        duration: 0.2,
        ease: 'power3.out',
        onUpdate: applyCa,
      })
      // The tear is the coverflow's: the stack's boards travel unclipped, and
      // an SVG filter on the track would clip them (and their shadows) to its
      // filter region.
      const tears = !reducedMotion && !stacked
      if (tears) {
        trackNode.style.filter = `url(#${caId})`
      }

      // --- Scroll: one pure write per frame ---------------------------------
      const tween = () => {
        if (tears) {
          const velocity = api.internalEngine().scrollBody.velocity()
          caTo(clamp(velocity * CA_VELOCITY_SCALE, -CA_MAX_PX, CA_MAX_PX))
        }
        paintSlides(identity)
      }

      // --- Playback + posters (settle-driven, see ./playback) ---------------
      const playback = createPlaybackController({
        api,
        contextSafe,
        dissolveId,
        dissolveMap,
        getSlideRefs: () => slideRefs,
        reducedMotion,
      })

      const onSettle = contextSafe(() => {
        // Embla can rest a hair off-snap; round so the active slide ends
        // dead-flat facing the viewer.
        paintSlides(Math.round)
        playback.syncVideos()
      })

      // --- Wiring -----------------------------------------------------------
      const setup = () => {
        tweenFactor = computeTweenFactor(api.scrollSnapList())
        slideRefs = api.slideNodes().map(collectSlideRefs)
        // First paint matches the server-rendered rest styles: same function,
        // same geometry.
        paintSlides(identity)
      }

      // Hidden tabs suspend muted playback and rAF; re-sync when shown again.
      const onVisibility = () => {
        if (!document.hidden) playback.syncVideos()
      }

      const onReInit = () => {
        setup()
        tween()
        onSettle()
      }

      // A tap on the pile deals the next board. Always the next one, never a
      // jump to the board tapped: embla's loop would take the short way round
      // and run the pile backwards. Embla swallows the click that ends a drag.
      const onClick = (event: MouseEvent) => {
        const slide = (event.target as Element).closest('[data-slot="carousel-item"]')
        const index = slide ? api.slideNodes().indexOf(slide as HTMLElement) : -1
        if (index < 0 || index === api.selectedScrollSnap()) return
        if (Number(slideRefs[index]?.node.style.opacity ?? 0) < 0.5) return
        api.scrollNext()
      }

      onReInit()
      api.on('reInit', onReInit)
      api.on('scroll', tween)
      api.on('settle', onSettle)
      document.addEventListener('visibilitychange', onVisibility)
      if (stacked) trackNode.addEventListener('click', onClick)

      return () => {
        trackNode.removeEventListener('click', onClick)
        document.removeEventListener('visibilitychange', onVisibility)
        api.off('reInit', onReInit)
        api.off('scroll', tween)
        api.off('settle', onSettle)
        playback.dispose()
        trackNode.style.filter = ''
      }
    },
    { dependencies: [api, pose, stacked] },
  )
}

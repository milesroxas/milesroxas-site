/**
 * Single source of truth for a slide's look at a given signed snap distance
 * from the active slide (negative = left). Used by the server render for
 * initial inline styles (no hydration flicker) and by the client tween for
 * every scroll frame — the two can never drift.
 */

const INACTIVE_SCALE = 0.8
const INACTIVE_OPACITY = 0.5
/** Coverflow: inactive slides turn their outer edge away from the viewer. */
const INACTIVE_ROTATE_DEG = 7
/**
 * Per-slide camera distance. CSS `perspective` on an ancestor only reaches its
 * direct children, so each slide carries its own perspective() in its
 * transform — without it the rotateY renders as a flat horizontal squash.
 */
const PERSPECTIVE_PX = 1200
/** Depth-of-field: recession and defocus grow per snap of distance from the active slide. */
const DEPTH_PER_SNAP_PX = 90
const BLUR_PER_SNAP_PX = 2
/** Distance cap (in snaps) so far loop slides don't shrink/blur into mush. */
const MAX_SNAP_DISTANCE = 2.5

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/**
 * Snaps of distance over which a caption fades. Far steeper than the pose:
 * a caption is the one part of a slide that must not peek — a sliver of a
 * neighbour showing two letters of its caption reads as clipped text rather
 * than as a slide continuing off-frame — so the ink is gone a third of a snap
 * out, while the media is still only slightly recessed.
 */
const CAPTION_FADE_SNAPS = 0.35

/**
 * Caption ink at a signed snap distance, on the same scroll position every
 * other slide value derives from. Left linear: it multiplies with the slide's
 * own opacity ramp above, and the product is already curved.
 */
export const captionOpacity = (signedSnapDistance: number): number =>
  1 - clamp(Math.abs(signedSnapDistance) / CAPTION_FADE_SNAPS, 0, 1)

/** 1 on the active slide, 0 from one snap out. Every ramp of the pose runs on it. */
const activeness = (distance: number): number => 1 - clamp(distance, 0, 1)

const poseScale = (distance: number): number =>
  INACTIVE_SCALE + (1 - INACTIVE_SCALE) * activeness(distance)

/** Depth is signed for the transform (negative = away); the magnitude keeps growing past one snap. */
const poseDepth = (distance: number): number =>
  -DEPTH_PER_SNAP_PX * clamp(distance, 0, MAX_SNAP_DISTANCE)

/**
 * Half the width the pose leaves a slide at `distance`, as a fraction of its
 * layout width: the scale-down, shrunk again by the perspective projection of
 * its depth. rotateY is deliberately left out. Its inner-edge recession is a
 * px quantity that depends on the slide's rendered width, which the server
 * render never knows, and leaving it out errs toward air: both inner edges
 * turn away, so the true gap is the gutter plus roughly a hundredth of the
 * slide's width, never an overlap.
 */
export const projectedHalfWidth = (distance: number): number =>
  (poseScale(distance) * PERSPECTIVE_PX) / (PERSPECTIVE_PX - poseDepth(distance)) / 2

/** Width, as a fraction of the slide, that the pose shaves off one of its edges. */
const edgeLoss = (distance: number): number => 0.5 - projectedHalfWidth(distance)

/**
 * Horizontal shift, as a fraction of the slide's own width, that packs the
 * deck. Scaling a neighbour about its centre opens a gap on its inner edge
 * that is a fraction of the slide's width: the wider the slide, the wider the
 * hole beside it, which is what capped the active slide's size. This pulls
 * every slide toward the active one by exactly what the pose shaved off the
 * edges between them (its own inner edge, plus both edges of each slide in
 * between), so the visible gap between any two neighbours is the layout
 * gutter alone at every scroll position, not just at rest. Continuous in the
 * distance: the running sum picks up a new term only as a slide's loss passes
 * through zero. Written as the leftmost transform function, so it lands in
 * screen space after the projection and is never itself scaled.
 */
export const packedShift = (signedSnapDistance: number): number => {
  const distance = Math.abs(signedSnapDistance)
  let shift = edgeLoss(distance)
  for (let between = distance - 1; between > 0; between -= 1) {
    shift += 2 * edgeLoss(between)
  }
  return -Math.sign(signedSnapDistance) * shift
}

export type SlideVisualState = {
  transform: string
  opacity: number
  filter: string
  /** Paint order, written to the slide's item. Only a pose whose slides overlap sets one. */
  zIndex?: number
  /** Stack only: the surface veil over the card (0 to 1) and its depth in the pile. */
  veil?: number
  depth?: number
  /**
   * Stack only: whether the card takes the pointer. A stack is unclipped, so
   * a faded board off to the left of the slot sits over the copy column and
   * would swallow its clicks.
   */
  interactive?: boolean
}

export const slideVisualState = (signedSnapDistance: number): SlideVisualState => {
  const distance = Math.abs(signedSnapDistance)
  const t = activeness(distance)

  const shift = packedShift(signedSnapDistance) * 100
  const scale = poseScale(distance)
  // Left slides turn their inner (right) edge back (+deg), right slides theirs
  // (-deg): each faces away from the active slide, so the inner edges recede.
  const rotate = -clamp(signedSnapDistance, -1, 1) * INACTIVE_ROTATE_DEG
  // Depth of field keeps growing with distance, so the second slide out sits
  // deeper and softer than the first.
  const depth = poseDepth(distance)
  const blur = BLUR_PER_SNAP_PX * clamp(distance, 0, MAX_SNAP_DISTANCE)

  return {
    transform: `translateX(${shift.toFixed(2)}%) perspective(${PERSPECTIVE_PX}px) translateZ(${depth.toFixed(1)}px) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
    opacity: INACTIVE_OPACITY + (1 - INACTIVE_OPACITY) * t,
    filter: `grayscale(${(1 - t).toFixed(3)}) blur(${blur.toFixed(2)}px)`,
  }
}

/**
 * The stack pose: the deck as a pile of presentation boards. Every slide is
 * pinned back into the active slot, so instead of a row the reader sees one
 * board on top and the next ones squared up behind it, each a step smaller
 * and fanned a step further right. The pile's stepped right edge is what says
 * there is more to pull; no control has to.
 *
 * The card is narrower than its slide (`stackCardFraction`) by exactly the
 * fan, so the back board's right edge lands on the column's end edge and the
 * pile fills the slot. Slides lay out edge to edge (no gutter), so a slide
 * `s` snaps out sits `s` slide widths right of the slot, which is
 * `s / fraction` card widths; the pin cancels exactly that.
 *
 * The top board peels off toward the pointer but lags it, on an eased path
 * that never travels more than `STACK_EXIT_TRAVEL` cards, lifting and
 * defocusing as it goes. The track is unclipped (the viewport does not clip
 * a stack), so the short path and a fade done by `STACK_EXIT_SNAPS` keep it
 * from sweeping across the copy column beside the deck; the blur turns the
 * overlap with the board coming forward into motion rather than a double
 * exposure. Dragging back runs the same curve in reverse.
 *
 * Boards behind the top one recede by aerial perspective, a veil of the
 * band's own surface (`veil`), not by darkening: shaded boards on a light
 * band read as black slabs, and the veil follows the band's theme for free.
 * `depth` is published for the hover fan (see `blocks/Carousel/Component`).
 *
 * Origin is the card's left edge (`origin-left` on the target), so a board's
 * left edge stays on the grid line at every depth and only the right edges
 * fan.
 */
/** Per board of depth: scale lost and right-edge reveal, as a fraction of the card. */
const STACK_STEP_SCALE = 0.06
const STACK_STEP_PEEK = 0.055
/** Surface veil per board of depth: the pile recedes into the band. */
const STACK_STEP_VEIL = 0.22
/**
 * Boards showing behind the top one. A board deeper than that waits squared
 * up under the last one, opaque, so it is revealed by the board above it
 * moving forward rather than faded in: a translucent board at the back of a
 * pile reads as a ghost. Fewer slides show fewer, so the board that just left
 * always folds back in under the pile (see `foldStackDistance`) rather than
 * appearing on it; two slides still show one, as a pile of none is no pile.
 */
const STACK_VISIBLE = 2
const stackDepthCap = (count: number) => Math.max(1, Math.min(STACK_VISIBLE, count - 2))
/**
 * The card's share of its slide. A board at depth `d` ends `1 + peek * d`
 * cards from the slot's start (its scale loss is shifted back out), so the
 * deepest showing board ends on the slot's end edge.
 */
export const stackCardFraction = (count = Number.POSITIVE_INFINITY) =>
  1 / (1 + STACK_STEP_PEEK * stackDepthCap(count))
/** The leaving board: its lift and defocus at the end of its fade, and that fade's length in snaps. */
const STACK_EXIT_SCALE = 0.04
const STACK_EXIT_BLUR_PX = 8
const STACK_EXIT_SNAPS = 0.4
/** The farthest the leaving board travels from the slot, in cards. */
const STACK_EXIT_TRAVEL = 0.4

/**
 * How far a board at `depth` sits tucked under the top card before the pile
 * deals out (see `useStackEntrance` in ./Component), as a translate of its
 * own width: its peek undone. The board is scaled, so its own width is the
 * card's times its scale.
 */
export const stackTuck = (depth: number) =>
  depth > 0 ? (-STACK_STEP_PEEK * depth) / (1 - STACK_STEP_SCALE * depth) : 0

/**
 * A stack slide's distance folded into (-1, count - 1]: one board leaving,
 * every other one somewhere in the pile. Embla only carries the slides it
 * needs to fill the viewport across the loop seam, and a one-slide viewport
 * needs almost none, so the raw distance of a far slide can sit on the wrong
 * side and leave a gap in the pile. Folded, the board that just left
 * re-enters at the back of the pile, under the boards that show
 * (`stackDepthCap`), so the wrap never shows.
 */
export const foldStackDistance = (signedSnapDistance: number, count: number): number =>
  count - 1 - ((((count - 1 - signedSnapDistance) % count) + count) % count)

export const stackVisualState = (
  signedSnapDistance: number,
  count = Number.POSITIVE_INFINITY,
): SlideVisualState => {
  // The pin is physical: it cancels where the slide actually is on the track.
  // Everything else is the slide's place in the pile.
  const fraction = stackCardFraction(count)
  const pin = signedSnapDistance / fraction
  const place = Number.isFinite(count)
    ? foldStackDistance(signedSnapDistance, count)
    : signedSnapDistance
  if (place < 0) {
    const away = Math.min(-place, 1)
    const t = clamp(away / STACK_EXIT_SNAPS, 0, 1)
    const travel = STACK_EXIT_TRAVEL * (1 - (1 - away) ** 2)
    const shift = (-pin - travel) * 100
    return {
      transform: `translateX(${shift.toFixed(2)}%) scale(${(1 - STACK_EXIT_SCALE * t).toFixed(4)})`,
      opacity: (1 - t) ** 2,
      filter: `blur(${(STACK_EXIT_BLUR_PX * t).toFixed(2)}px)`,
      // On top while it leaves; once gone, under everything so it never takes a click.
      zIndex: away < 1 ? 200 : 0,
      veil: 0,
      depth: 0,
      interactive: t < 0.5,
    }
  }
  const cap = stackDepthCap(count)
  const depth = Math.min(place, cap)
  const scale = 1 - STACK_STEP_SCALE * depth
  // Pinned into the slot, then pushed right so the scaled board's right edge
  // clears the one above it by a peek per step.
  const shift = (-pin + (1 - scale) + STACK_STEP_PEEK * depth) * 100
  return {
    transform: `translateX(${shift.toFixed(2)}%) scale(${scale.toFixed(4)})`,
    // Past one board under the cap it is covered anyway; dropping it keeps
    // the hidden boards' shadows from stacking up.
    opacity: place > cap + 1 ? 0 : 1,
    filter: 'none',
    zIndex: 100 - Math.round(place * 10),
    veil: STACK_STEP_VEIL * depth,
    depth,
    interactive: place <= cap,
  }
}

export type DeckStyle = 'coverflow' | 'stack'

/** A deck's pose: a slide's look from its signed snap distance and the deck's slide count. */
export type DeckPose = (signedSnapDistance: number, count: number) => SlideVisualState

export const deckPose: Record<DeckStyle, DeckPose> = {
  coverflow: (signedSnapDistance) => slideVisualState(signedSnapDistance),
  stack: stackVisualState,
}

/**
 * Rest-state signed distance for a slide by index, mirroring a centered embla
 * loop where index 0 is active: slides in the back half of the list approach
 * from the left. Only used for the server-rendered initial styles.
 */
export const restSignedDistance = (index: number, count: number): number =>
  index <= count / 2 ? index : index - count

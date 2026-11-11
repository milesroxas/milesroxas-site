/**
 * The tab swap: one sideways gesture in the direction of travel. Choosing a
 * tab to the right moves the strip's ink right, opens the new plate from its
 * right edge and drifts the new copy in from the right; choosing one to the
 * left mirrors it. The copy answers at once, the plate follows as its
 * picture is ready, so the change always reads as a response to the tap.
 *
 * Kept apart from the scroll entrance on purpose: that wipes frames open from
 * the top and is first-seen language, while this travels along the strip.
 *
 * Panels mark what moves:
 * - `data-tab-swap="plate"`: the frame that wipes open over the old one.
 * - `data-tab-swap="settle"`: the picture inside it, settling from a slight push-in.
 * - `data-tab-swap="copy"`: a piece of copy; pieces cascade in document order.
 */
export const TAB_SWAP_MOTION = {
  /** `--ease-out-quint`: the change lands in the first third, then settles. */
  ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** The old copy leaving (`--ease-out-cubic`): mostly gone before the new copy shows. */
  exitEase: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  plate: { duration: 1000, from: 1.06, settle: 1400 },
  copy: {
    duration: 600,
    /** Where the first piece starts, as the old copy's exit runs out (ms). */
    delay: 110,
    stagger: 50,
    /** Longest a burst of pieces takes to cascade (ms), as the scroll entrance caps it. */
    cascade: 400,
    travel: '0.75rem',
    blur: 4,
  },
  exit: { duration: 160, travel: '0.5rem' },
  /** The ink under the active tab (ms), on the deck index's thumb length. */
  ink: 500,
  /** Longest the new plate holds closed while its first picture loads (ms). */
  hold: 600,
  /** Reduced motion: a plain crossfade, no travel, no blur (ms). */
  fade: 300,
} as const

export type SwapDirection = 1 | -1

/** A running swap: every animation it started, run back together when the reader returns. */
export type TabSwap = {
  animations: Animation[]
  /** The plate's animations, held at their start until the picture is ready. */
  plate: Animation[]
  plateStarted: boolean
  /** Resolves once the plate may open (picture ready, or the hold ran out). */
  ready: Promise<void>
  reversed: boolean
}

const parts = (root: HTMLElement | undefined, part: string) =>
  root ? Array.from(root.querySelectorAll<HTMLElement>(`[data-tab-swap="${part}"]`)) : []

/** Painted at this breakpoint: a plate hidden under `lg` for an empty slot is not. */
const shown = (el: HTMLElement | undefined) => Boolean(el?.getClientRects().length)

/**
 * Resolves once the plate's first picture can paint, or after `hold` ms. Its
 * pictures turn eager first: a lazy image under a closed clip counts as out
 * of view and would never start.
 */
const whenPictureReady = (plate: HTMLElement | undefined, hold: number) =>
  new Promise<void>((resolve) => {
    const images = plate?.querySelectorAll('img') ?? []
    for (const image of images) image.loading = 'eager'
    const image = images[0]
    if (!image || (image.complete && image.naturalWidth > 0)) return resolve()
    const timer = setTimeout(resolve, hold)
    image
      .decode()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        resolve()
      })
  })

/**
 * Starts the swap from `outgoing` to `incoming`. Every animation fills both
 * ways, so the incoming panel is closed from its first frame and a reversed
 * swap lands exactly where it began.
 */
export function playTabSwap({
  direction,
  incoming,
  outgoing,
  reduced,
}: {
  direction: SwapDirection
  incoming: HTMLElement | undefined
  outgoing: HTMLElement | undefined
  reduced: boolean
}): TabSwap {
  const { copy, ease, exit, exitEase, fade, hold, plate } = TAB_SWAP_MOTION
  const animations: Animation[] = []
  const add = (el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = el.animate(keyframes, { fill: 'both', ...options })
    animations.push(animation)
    return animation
  }

  const incomingPlate = parts(incoming, 'plate')[0]
  const outgoingPlate = parts(outgoing, 'plate')[0]
  const hasPicture = shown(incomingPlate) && parts(incomingPlate, 'settle').some(shown)

  for (const piece of parts(outgoing, 'copy')) {
    add(
      piece,
      reduced
        ? [{ opacity: 0 }]
        : [{ opacity: 0, translate: `calc(${exit.travel} * ${-direction}) 0` }],
      { duration: reduced ? fade / 2 : exit.duration, easing: exitEase },
    )
  }

  const pieces = parts(incoming, 'copy')
  const step = pieces.length > 1 ? Math.min(copy.stagger, copy.cascade / (pieces.length - 1)) : 0
  pieces.forEach((piece, index) => {
    add(
      piece,
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            {
              opacity: 0,
              translate: `calc(${copy.travel} * ${direction}) 0`,
              filter: `blur(${copy.blur}px)`,
            },
            { opacity: 1, translate: '0 0', filter: 'blur(0px)' },
          ],
      {
        delay: reduced ? 0 : copy.delay + index * step,
        duration: reduced ? fade : copy.duration,
        easing: ease,
      },
    )
  })

  // An empty slot cannot cover the old picture, so the old plate makes way.
  if (outgoingPlate && !hasPicture) {
    add(outgoingPlate, [{ opacity: 0 }], { duration: fade, easing: ease })
  }

  const plateMotion: Animation[] = []
  if (incomingPlate && hasPicture) {
    plateMotion.push(
      add(
        incomingPlate,
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              // An explicit end: `inset()` cannot interpolate to `none`.
              { clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
              { clipPath: 'inset(0 0 0 0)' },
            ],
        { duration: reduced ? fade : plate.duration, easing: ease },
      ),
    )
    if (!reduced) {
      for (const picture of parts(incomingPlate, 'settle')) {
        plateMotion.push(
          add(picture, [{ scale: plate.from }, { scale: 1 }], {
            duration: plate.settle,
            easing: ease,
          }),
        )
      }
    }
    for (const animation of plateMotion) animation.pause()
  }

  const swap: TabSwap = {
    animations,
    plate: plateMotion,
    plateStarted: plateMotion.length === 0,
    ready: whenPictureReady(incomingPlate, hold),
    reversed: false,
  }
  swap.ready.then(() => {
    if (!swap.reversed) startPlate(swap)
  })
  return swap
}

function startPlate(swap: TabSwap) {
  if (swap.plateStarted) return
  swap.plateStarted = true
  for (const animation of swap.plate) animation.play()
}

/**
 * Runs the swap the other way from wherever it is. A plate still holding for
 * its picture stays closed: reversing an animation at its start would rewind
 * it to its end and flash the plate open.
 */
export function reverseTabSwap(swap: TabSwap) {
  swap.reversed = !swap.reversed
  for (const animation of swap.animations) {
    if (swap.plateStarted || !swap.plate.includes(animation)) animation.reverse()
  }
}

/** Resolves when the swap has landed, whichever way it runs. */
export async function tabSwapSettled(swap: TabSwap) {
  if (!swap.reversed) await swap.ready
  // Forward again after the picture loaded while reversed: open the plate now.
  if (!swap.reversed) startPlate(swap)
  const live = swap.animations.filter((a) => swap.plateStarted || !swap.plate.includes(a))
  await Promise.all(live.map((animation) => animation.finished)).catch(() => {})
}

export function cancelTabSwap(swap: TabSwap | undefined) {
  if (!swap) return
  swap.reversed = true
  for (const animation of swap.animations) animation.cancel()
}

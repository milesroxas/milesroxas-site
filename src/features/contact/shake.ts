/**
 * A "no": the field is knocked sideways and rings out on an underdamped
 * spring, x(t) = A·e^(-t/τ)·sin(2πft), sampled across the duration. 10px,
 * 5Hz, τ 130ms over 600ms: swings of about 7, 3, 1.5 and 0.7px, landing on 0.
 */
const SHAKE_MS = 600
const SHAKE: Keyframe[] = Array.from({ length: 37 }, (_, i) => {
  const t = (i / 36) * (SHAKE_MS / 1000)
  const x = -10 * Math.exp(-t / 0.13) * Math.sin(2 * Math.PI * 5 * t)
  return { transform: `translateX(${x.toFixed(2)}px)` }
})

/** Each field down the form answers 60ms after the one above it. */
const SHAKE_STEP_MS = 60

/** Shakes each element in turn; a repeat send restarts the shake. Reduced motion skips it. */
export function shake(elements: (Element | null | undefined)[]) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  elements.filter(Boolean).forEach((element, index) => {
    for (const running of element?.getAnimations() ?? [])
      if (running.id === 'contact-shake') running.cancel()
    const animation = element?.animate(SHAKE, {
      delay: index * SHAKE_STEP_MS,
      duration: SHAKE_MS,
    })
    if (animation) animation.id = 'contact-shake'
  })
}

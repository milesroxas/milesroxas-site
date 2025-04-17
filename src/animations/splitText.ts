import gsap from 'gsap'
import SplitType from 'split-type'

type SplitTextOptions = {
  stagger?: number
  delay?: number
  y?: number
  duration?: number
  ease?: string
}

export function animateSplitTextIn(target: HTMLElement, options: SplitTextOptions = {}) {
  const { stagger = 0.02, delay = 0.1, y = 20, duration = 0.2, ease = 'power3.out' } = options

  const split = new SplitType(target, { types: 'words,chars' })

  gsap.set(split.chars, { opacity: 0, y })
  gsap.to(split.chars, { opacity: 1, y: 0, duration, stagger, ease, delay })

  return split
}

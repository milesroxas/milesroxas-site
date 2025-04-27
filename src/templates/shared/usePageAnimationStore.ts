import { create } from 'zustand'
import { gsap } from 'gsap'

type PageAnimationStore = {
  collapseFrame: (onComplete?: () => void) => void
  restoreFrame: (onComplete?: () => void) => void
}

export const usePageAnimationStore = create<PageAnimationStore>((set) => ({
  collapseFrame: (onComplete) => {
    const horiz = '#site-frame .frame-bar-horizontal'
    const vert = '#site-frame .frame-bar-vertical'

    // collapse into corners
    gsap.to(horiz, { height: 0, duration: 0.5, ease: 'power2.in' })
    gsap.to(vert, {
      width: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete,
    })
  },

  restoreFrame: (onComplete) => {
    const horiz = '#site-frame .frame-bar-horizontal'
    const vert = '#site-frame .frame-bar-vertical'

    // expand back to full size
    gsap.to(horiz, { height: '40px', duration: 0.3, ease: 'power2.out' })
    gsap.to(vert, {
      width: '40px',
      duration: 0.3,
      ease: 'power2.out',
      onComplete,
    })
  },
}))

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

    // Check if we're on mobile
    const isMobile = window.innerWidth < 768
    const frameSize = isMobile ? '16px' : '40px'

    // expand back to full size respecting responsive sizes
    gsap.to(horiz, { height: frameSize, duration: 0.3, ease: 'power2.out' })
    gsap.to(vert, {
      width: frameSize,
      duration: 0.3,
      ease: 'power2.out',
      onComplete,
    })
  },
}))

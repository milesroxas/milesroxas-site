import { create } from 'zustand'
import { gsap } from 'gsap'

type PageAnimationStore = {
  collapseFrame: (onComplete?: () => void) => void
  restoreFrame: (onComplete?: () => void) => void
}

export const usePageAnimationStore = create<PageAnimationStore>((set) => ({
  collapseFrame: (onComplete) => {
    const topHoriz = '#site-frame .frame-bar-horizontal:first-child'
    const bottomHoriz = '#site-frame .frame-bar-horizontal:nth-child(3)'
    const vert = '#site-frame .frame-bar-vertical'

    // collapse into corners
    gsap.to(topHoriz, { height: 0, duration: 0.5, ease: 'power2.in' })
    gsap.to(bottomHoriz, { height: 0, duration: 0.5, ease: 'power2.in' })
    gsap.to(vert, {
      width: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete,
    })
  },

  restoreFrame: (onComplete) => {
    const topHoriz = '#site-frame .frame-bar-horizontal:first-child'
    const bottomHoriz = '#site-frame .frame-bar-horizontal:nth-child(3)'
    const rightVert = '#site-frame .frame-bar-vertical:nth-child(2)'
    const leftVert = '#site-frame .frame-bar-vertical:last-child'

    // Get computed styles from actual frame elements to match SiteFrame exactly
    const getComputedFrameSize = (element: string) => {
      const el = document.querySelector(element)
      if (!el) return null

      // Read the computed styles from the actual DOM elements
      const styles = window.getComputedStyle(el)
      return element.includes('horizontal') ? styles.height : styles.width
    }

    // Animate each element to its computed size from the DOM
    gsap.to(topHoriz, {
      height: () => getComputedFrameSize(topHoriz) || '0px',
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(bottomHoriz, {
      height: () => getComputedFrameSize(bottomHoriz) || '0px',
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(rightVert, {
      width: () => getComputedFrameSize(rightVert) || '0px',
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(leftVert, {
      width: () => getComputedFrameSize(leftVert) || '0px',
      duration: 0.3,
      ease: 'power2.out',
      onComplete,
    })
  },
}))

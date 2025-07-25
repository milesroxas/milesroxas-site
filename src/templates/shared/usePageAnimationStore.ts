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

    // Create a timeline for sequential animation
    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.inOut',
        duration: 0.8, // Increased from 0.3 to 0.8 for slower animation
      },
      onComplete,
    })

    // Animate top horizontal bar first
    tl.to(topHoriz, {
      height: () => getComputedFrameSize(topHoriz) || '0px',
    })

    // Animate vertical bars next
    tl.to(
      [rightVert, leftVert],
      {
        width: (i, el) => {
          const selector = el.matches(rightVert) ? rightVert : leftVert
          return getComputedFrameSize(selector) || '0px'
        },
      },
      '-=0.4', // Start slightly before the previous animation finishes
    )

    // Animate bottom horizontal bar last
    tl.to(
      bottomHoriz,
      {
        height: () => getComputedFrameSize(bottomHoriz) || '0px',
      },
      '-=0.4', // Start slightly before the previous animation finishes
    )
  },
}))

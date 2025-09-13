'use client'

import { useCallback } from 'react'
import { gsap } from '@/lib/gsap/config'

export const useFrameAnimation = () => {
  const collapseFrame = useCallback((onComplete?: () => void) => {
    const topHoriz = '#site-frame .frame-bar-horizontal:first-child'
    const bottomHoriz = '#site-frame .frame-bar-horizontal:nth-child(3)'
    const vert = '#site-frame .frame-bar-vertical'

    gsap.to(topHoriz, { height: 0, duration: 0.5, ease: 'power2.in' })
    gsap.to(bottomHoriz, { height: 0, duration: 0.5, ease: 'power2.in' })
    gsap.to(vert, { width: 0, duration: 0.5, ease: 'power2.in', onComplete })
  }, [])

  const restoreFrame = useCallback((onComplete?: () => void) => {
    const topHoriz = '#site-frame .frame-bar-horizontal:first-child'
    const bottomHoriz = '#site-frame .frame-bar-horizontal:nth-child(3)'
    const rightVert = '#site-frame .frame-bar-vertical:nth-child(2)'
    const leftVert = '#site-frame .frame-bar-vertical:last-child'

    const getComputedFrameSize = (element: string) => {
      const el = document.querySelector(element)
      if (!el) return null
      const styles = window.getComputedStyle(el)
      return element.includes('horizontal') ? styles.height : styles.width
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 0.8 },
      onComplete,
    })

    tl.to(topHoriz, { height: () => getComputedFrameSize(topHoriz) || '0px' })
      .to([rightVert, leftVert], {
        width: (i, el) => {
          const selector = (el as Element).matches(rightVert) ? rightVert : leftVert
          return getComputedFrameSize(selector) || '0px'
        },
      }, '-=0.4')
      .to(bottomHoriz, { height: () => getComputedFrameSize(bottomHoriz) || '0px' }, '-=0.4')
  }, [])

  return { collapseFrame, restoreFrame }
}

export default useFrameAnimation


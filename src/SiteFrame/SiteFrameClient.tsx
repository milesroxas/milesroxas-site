'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { useSiteFrameStore } from '@/stores/siteframeStore'
import BottomSection from './BottomSection/Component'

interface SiteFrameClientProps {
  children: ReactNode
}

export const SiteFrameClient = ({ children }: SiteFrameClientProps) => {
  const { isSiteFrameVisible, isTransitioning } = useSiteFrameStore()

  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (isSiteFrameVisible && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: isTransitioning ? 0.8 : 0.5,
            ease: 'power1.inOut',
            delay: isTransitioning ? 0.75 : 0,
          },
        )
      }
    },
    { scope: containerRef, dependencies: [isSiteFrameVisible, isTransitioning] },
  )

  // Keep the tree shape stable when the frame toggles: returning a different
  // structure here remounts the whole page mid-transition, which lets the
  // source page's hero steal the transition clone.
  return (
    <div className="min-h-screen">
      {isSiteFrameVisible && (
        <div id="site-frame" ref={containerRef} className="pointer-events-none fixed inset-0 z-50">
          <div className="frame-bar frame-bar-horizontal md:!h-[30px] lg:!h-[40px] fixed top-0 right-0 left-0 h-2 bg-white will-change-transform" />
          <div className="frame-bar frame-bar-vertical md:!w-[30px] lg:!w-[40px] fixed top-0 right-0 bottom-0 w-2 bg-white will-change-transform" />
          <div
            className="frame-bar frame-bar-horizontal md:!h-[30px] lg:!h-[40px] fixed right-0 left-0 flex h-10 items-center bg-white will-change-transform"
            style={{
              transform: 'translateZ(0)',
              bottom: '0',
              position: 'fixed',
              height: 'calc(var(--vh, 1vh) * 10)',
              maxHeight: '40px',
              zIndex: 50,
            }}
          >
            <BottomSection />
          </div>
          <div className="frame-bar frame-bar-vertical md:!w-[30px] lg:!w-[40px] fixed top-0 bottom-0 left-0 w-2 bg-white will-change-transform" />
        </div>
      )}

      {children}
    </div>
  )
}

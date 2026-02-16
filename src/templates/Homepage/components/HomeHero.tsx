'use client'
import { useRef, useState } from 'react'
import { marqueeKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'
import styles from '../styles/home.module.css'

export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const experienceText = [
    'Co-Founder',
    'Creative Director',
    'Web Designer',
    'Brand Designer',
    'Product Design',
    'Design Engineer',
  ]

  const skillsText = [
    'Brand Identity Development',
    'Visual Identity Design',
    'Web Design',
    'Web Development',
    'Product Stategy',
    'Product Design',
    'Design Engineer',
    '3D Modeling & Rendering',
  ]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Skills text behind (lower z-index, starts at 25vh) */}
      <div className="absolute top-[40vh] z-0 w-full">
        <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono')}>
          {[...skillsText, ...skillsText].map((text, index) => (
            <div
              key={marqueeKeys.fromItem(
                text,
                index % skillsText.length,
                Math.floor(index / skillsText.length),
              )}
              className={styles.marqueeItem}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Video */}
      <div className="relative z-10 flex justify-center py-24">
        <div className="relative h-[30vh] w-[30vh]">
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800"></div>
            </div>
          )}
          <video
            ref={videoRef}
            className={cn('h-full w-full rounded-sm object-cover', !isVideoLoaded && 'opacity-0')}
            src="/media/home-hero.mp4"
            poster="/media/intro-test-poster.jpg"
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={async () => {
              setIsVideoLoaded(true)
              const video = videoRef.current
              if (!video) return
              try {
                await video.play()
              } catch {
                // Autoplay can be blocked in edge cases; keep poster visible.
              }
            }}
            onError={() => {
              // If the video fails to load, show poster (don’t leave users stuck on a spinner).
              setIsVideoLoaded(true)
            }}
          />
        </div>
      </div>

      {/* Experience text in front (higher z-index, slightly below the skills text) */}
      <div className="absolute top-[50vh] z-20 w-full">
        <div className={cn(styles.marquee, 'flex flex-row items-center gap-12 font-mono')}>
          {[...experienceText, ...experienceText].map((text, index) => (
            <div
              key={marqueeKeys.fromItem(
                text,
                index % experienceText.length,
                Math.floor(index / experienceText.length),
              )}
              className={styles.marqueeItem}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

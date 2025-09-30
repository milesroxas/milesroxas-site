'use client'
import styles from '../styles/home.module.css'
import { cn } from '@/utilities/ui'
import { useRef, useState } from 'react'

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
            <div key={index} className={styles.marqueeItem}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Video */}
      <div className="relative z-10 flex justify-center py-24">
        {!isVideoLoaded && (
          <div className="flex h-[30vh] w-[30vh] items-center justify-center rounded-sm bg-gray-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800"></div>
          </div>
        )}
        <video
          ref={videoRef}
          className={cn('w-[30vh] rounded-sm object-cover', !isVideoLoaded && 'hidden')}
          src="/media/home-hero.mp4"
          poster="/media/intro-test-poster.jpg"
          preload="metadata"
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
        />
      </div>

      {/* Experience text in front (higher z-index, slightly below the skills text) */}
      <div className="absolute top-[50vh] z-20 w-full">
        <div className={cn(styles.marquee, 'flex flex-row items-center gap-12 font-mono')}>
          {[...experienceText, ...experienceText].map((text, index) => (
            <div key={index} className={styles.marqueeItem}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

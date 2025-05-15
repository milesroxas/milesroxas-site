'use client'
import styles from '../styles/home.module.css'
import { cn } from '@/utilities/ui'
import { useEffect, useRef, useState } from 'react'

export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

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

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch((error) => {
        console.error('Video playback failed:', error)
        setVideoError(true)
      })
    }
  }, [])

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
        {!videoError ? (
          <video
            ref={videoRef}
            className="w-[30vh] rounded-sm object-cover"
            src="/media/home-hero.mp4"
            poster="/media/intro-test-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="flex aspect-video w-[30vh] items-center justify-center rounded-sm bg-gray-100">
            <p className="text-sm text-gray-500">Video unavailable</p>
          </div>
        )}
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

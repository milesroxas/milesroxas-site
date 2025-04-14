'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import PageTransition from '@/components/PageTransition'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()
  const { setTheme } = useTheme()
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setHeaderTheme('light')
    setTheme('light')

    // Animation setup using SplitType and GSAP
    if (paragraphRef.current) {
      // Split the text into characters
      const splitText = new SplitType(paragraphRef.current, { types: 'words,chars' })

      // Set initial state (opacity 0)
      gsap.set(splitText.chars, {
        opacity: 0,
        y: 20,
      })

      // Create staggered animation
      gsap.to(splitText.chars, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        stagger: 0.02,
        ease: 'power3.out',
        delay: 0.1,
      })
    }
  }, [setHeaderTheme, setTheme])

  return (
    <PageTransition>
      <div>
        <div className="container mb-16">
          <h2 className="text-sm uppercase font-mono text-accent mb-4">Works</h2>
          <p ref={paragraphRef} className="text-3xl font-light">
            I help businesses define–or redefine–their brand through a blend of powerfully
            insightful consultative services and creative production.
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

export default PageClient

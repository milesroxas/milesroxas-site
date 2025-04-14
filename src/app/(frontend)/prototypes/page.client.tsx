'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import Link from 'next/link'
import useTransitionNavigation from '@/hooks/useTransitionNavigation'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()
  const { setTheme } = useTheme()
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const { handleNavigate, isNavigating } = useTransitionNavigation()

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
    <div>
      <div className="container mb-16">
        <h2 className="text-sm uppercase font-mono text-accent mb-4">Works</h2>
        <p ref={paragraphRef} className="text-3xl font-light">
          I help businesses define–or redefine–their brand through a blend of powerfully insightful
          consultative services and creative production.
        </p>
      </div>

      {/* Navigation test section */}
      <div className="container mb-16">
        <h2 className="text-sm uppercase font-mono text-accent mb-4">Navigation Test</h2>
        <p className="mb-6">
          This section demonstrates Next.js 15.3 navigation hooks with GSAP fade transitions:
        </p>

        <div className="flex space-x-4">
          <Link
            href="/"
            onNavigate={handleNavigate}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition inline-block"
          >
            Home
            {isNavigating && <span className="ml-2">→</span>}
          </Link>
          <Link
            href="/works"
            onNavigate={handleNavigate}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition inline-block"
          >
            Works
            {isNavigating && <span className="ml-2">→</span>}
          </Link>
          <Link
            href="/posts"
            onNavigate={handleNavigate}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition inline-block"
          >
            Posts
            {isNavigating && <span className="ml-2">→</span>}
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="text-sm uppercase font-mono text-accent mb-4">Navigation Status</h3>
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${isNavigating ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
            <p>{isNavigating ? 'Navigation in progress...' : 'Ready to navigate'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageClient

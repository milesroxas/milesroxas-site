'use client'

import { useGSAP } from '@gsap/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef, useState } from 'react'
import type { CallOutBlock as CallOutBlockProps } from '@/payload-types'
import { getEnv } from '@/utilities/getEnv'

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP)

const { isPreview } = getEnv()

const useFontsLoaded = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    const handleFontsLoaded = () => {
      setFontsLoaded(true)
    }

    if (document.fonts) {
      if (document.fonts.status === 'loaded') {
        setFontsLoaded(true)
      } else {
        document.fonts.addEventListener('loadingdone', handleFontsLoaded)
      }
    } else {
      // Fallback for older browsers or SSR
      const timer = setTimeout(() => setFontsLoaded(true), 100)
      return () => clearTimeout(timer)
    }

    return () => {
      if (document.fonts) {
        document.fonts.removeEventListener('loadingdone', handleFontsLoaded)
      }
    }
  }, [])

  return fontsLoaded
}

export const CallOutBlock: React.FC<CallOutBlockProps> = ({ richText }) => {
  const container = useRef<HTMLDivElement>(null)

  const fontsLoaded = useFontsLoaded()

  useGSAP(
    () => {
      if (!container.current || !fontsLoaded) return

      // Find the actual text elements inside RichText
      const textElements = container.current.querySelectorAll('p, h1, h2, h3, h4, h5, h6')

      if (textElements.length === 0) return

      textElements.forEach((textElement) => {
        // Set initial opacity
        gsap.set(textElement, { opacity: 1 })

        SplitText.create(textElement, {
          type: 'words,lines',
          mask: 'lines',
          linesClass: 'line',
          autoSplit: true,
          onSplit: (instance) => {
            console.log('split')
            return gsap.from(instance.lines, {
              yPercent: 120,
              stagger: 0.1,
              scrollTrigger: {
                trigger: container.current,
                markers: isPreview,
                scrub: true,
                start: 'clamp(top center)',
                end: 'clamp(bottom center)',
              },
            })
          },
        })
      })

      return () => {}
    },
    {
      scope: container,
      dependencies: [fontsLoaded],
    },
  )

  return (
    // Type on the page, not a painted band: a `data-theme` pin would make the
    // dock swap material while it floats over this scroll. The veil fades the
    // words out through the dock's band so they don't show through the glass.
    <div className="relative" ref={container}>
      <div className="container mx-auto flex min-h-[50dvh] max-w-3/4 items-center align-middle">
        <div className="w-full text-center font-light text-4xl leading-loose">
          {richText && <RichText className="mb-0" data={richText} />}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none sticky bottom-0 z-10 -mt-36 h-36 bg-gradient-to-t from-background from-65% to-transparent"
      />
    </div>
  )
}

'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'

import PageTransition from '@/components/PageTransition'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import { Media } from '@/components/Media'
import SceneSetter from '@/r3f/canvas/SceneSetter'
import type { SceneTrackRefs } from '@/r3f/types/r3f'
import type { Post, Work } from '@/payload-types'

interface HomeTemplateClientProps {
  posts?: Post[]
  works?: Work[]
}

const HomeTemplateClient: React.FC<HomeTemplateClientProps> = ({ posts, works }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const { setTheme } = useTheme()

  const heroRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ] as [
    React.RefObject<HTMLDivElement>,
    React.RefObject<HTMLDivElement>,
    React.RefObject<HTMLDivElement>,
    React.RefObject<HTMLDivElement>,
  ]

  const trackedRefs: SceneTrackRefs = {
    heroSection: heroRef,
    cards: cardRefs,
    banner: bannerRef,
    ctaSection: ctaRef,
  }

  useEffect(() => {
    setHeaderTheme('light')
    setTheme('light')

    if (paragraphRef.current) {
      const splitText = new SplitType(paragraphRef.current, { types: 'words,chars' })

      gsap.set(splitText.chars, { opacity: 0, y: 20 })
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
      <SceneSetter scene="home" trackedRefs={trackedRefs} />

      <PageTransition>
        <div ref={heroRef}>
          <div className="container mb-16">
            <h2 className="text-sm uppercase font-mono text-accent mb-4">Works</h2>
            <p ref={paragraphRef} className="text-3xl font-light">
              I help businesses define–or redefine–their brand through a blend of powerfully
              insightful consultative services and creative production.
            </p>
          </div>
        </div>

        <section className="container">
          <div className="flex flex-wrap gap-12 mb-12">
            {posts?.[0] && (
              <div className="w-full md:w-[31%]">
                <div ref={cardRefs[0]} className="aspect-[4/5]"></div>
                {posts?.[0].heroImage && (
                  <Media
                    resource={posts?.[0].heroImage}
                    imgClassName="w-full h-auto object-cover aspect-[4/5]"
                    alt={posts?.[0].title}
                  />
                )}
                <h2 className="mt-4 text-xl font-bold">{posts?.[0].title}</h2>
                <p className="mt-2">{posts?.[0].meta?.description}</p>
              </div>
            )}

            {works?.[0] && (
              <div className="w-full md:w-[62%]">
                <div ref={cardRefs[1]} className="aspect-[16/9]"></div>
                {works?.[0].hero?.media && (
                  <Media
                    resource={works?.[0].hero?.media}
                    imgClassName="w-full h-auto object-cover aspect-[16/9]"
                    alt={works?.[0].title}
                  />
                )}
                <h2 className="mt-4 text-xl font-bold">{works?.[0].title}</h2>
                <p className="mt-2">{works?.[0].meta?.description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-12 mb-12">
            {works?.[1] && (
              <div className="w-full md:w-[62%]">
                <div ref={cardRefs[2]} className="aspect-[16/9]"></div>
                {works?.[1].hero?.media && (
                  <Media
                    resource={works?.[1].hero.media}
                    imgClassName="w-full h-auto object-cover aspect-[16/9]"
                    alt={works?.[1].title}
                  />
                )}
                <h2 className="mt-4 text-xl font-bold">{works?.[1].title}</h2>
                <p className="mt-2">{works?.[1].meta?.description}</p>
              </div>
            )}
            {posts?.[1] && (
              <div className="w-full md:w-[31%]">
                <div ref={cardRefs[3]} className="aspect-[16/9]"></div>
                {posts?.[1].heroImage && (
                  <Media
                    resource={posts?.[1].heroImage}
                    imgClassName="w-full h-auto object-cover aspect-[4/5]"
                    alt={posts?.[1].title}
                  />
                )}
                <h2 className="mt-4 text-xl font-bold">{posts?.[1].title}</h2>
                <p className="mt-2">{posts?.[1].meta?.description}</p>
              </div>
            )}
          </div>
        </section>
      </PageTransition>
    </div>
  )
}

export default HomeTemplateClient

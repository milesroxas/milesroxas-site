'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import Link from 'next/link'
import { getClientSideURL } from '@/utilities/getURL'

import PageTransition from '@/components/PageTransition'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import SceneSetter from '@/r3f/canvas/SceneSetter'
import type { SceneTrackRefs } from '@/r3f/types/r3f'
import type { Post, Work } from '@/payload-types'
import useClickableCard from '@/utilities/useClickableCard'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import HomeHero from './components/HomeHero'
import { cn } from '@/utilities/ui'

interface HomeTemplateClientProps {
  posts?: Post[]
  works?: Work[]
}

const HomeTemplateClient: React.FC<HomeTemplateClientProps> = ({ posts, works }) => {
  const base = getClientSideURL()
  const { setHeaderTheme } = useHeaderTheme()
  const { setTheme } = useTheme()
  const setResources = useSceneStore((s) => s.setResources)
  const setCollections = useSceneStore((s) => s.setCollections)
  const setHoveredIndex = useSceneStore((s) => s.setHoveredIndex)
  const setMouseUV = useSceneStore((s) => s.setMouseUV)
  const heroRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  // Predefine refs and clickable card hooks for each possible card slot (4 total)
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]
  const imageRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]
  const linkRefs = [
    useClickableCard<HTMLDivElement>({}).link.ref,
    useClickableCard<HTMLDivElement>({}).link.ref,
    useClickableCard<HTMLDivElement>({}).link.ref,
    useClickableCard<HTMLDivElement>({}).link.ref,
  ]

  // Build cards array dynamically in the order: post0, work0, work1, post1
  const cards = [
    posts?.[0] &&
    posts[0].heroImage &&
    typeof posts[0].heroImage === 'object' &&
    posts[0].heroImage.url
      ? {
          ref: cardRefs[0],
          imageRef: imageRefs[0],
          resource: { url: `${base}${posts[0].heroImage.url}`, variant: 'portrait' as const },
          collection: { variant: 'post' as const },
          type: 'post',
          data: posts[0],
          linkRef: linkRefs[0],
        }
      : null,
    works?.[0] &&
    works[0].hero?.media &&
    typeof works[0].hero.media === 'object' &&
    works[0].hero.media.url
      ? {
          ref: cardRefs[1],
          imageRef: imageRefs[1],
          resource: { url: `${base}${works[0].hero.media.url}`, variant: 'wide' as const },
          collection: { variant: 'work' as const },
          type: 'work',
          data: works[0],
          linkRef: linkRefs[1],
        }
      : null,
    works?.[1] &&
    works[1].hero?.media &&
    typeof works[1].hero.media === 'object' &&
    works[1].hero.media.url
      ? {
          ref: cardRefs[2],
          imageRef: imageRefs[2],
          resource: { url: `${base}${works[1].hero.media.url}`, variant: 'wide' as const },
          collection: { variant: 'work' as const },
          type: 'work',
          data: works[1],
          linkRef: linkRefs[2],
        }
      : null,
    posts?.[1] &&
    posts[1].heroImage &&
    typeof posts[1].heroImage === 'object' &&
    posts[1].heroImage.url
      ? {
          ref: cardRefs[3],
          imageRef: imageRefs[3],
          resource: { url: `${base}${posts[1].heroImage.url}`, variant: 'wide' as const },
          collection: { variant: 'post' as const },
          type: 'post',
          data: posts[1],
          linkRef: linkRefs[3],
        }
      : null,
  ].filter(Boolean) as Array<{
    ref: React.RefObject<HTMLDivElement>
    imageRef: React.RefObject<HTMLDivElement>
    resource: { url: string; variant: 'portrait' | 'wide' | 'square' }
    collection: { variant: 'post' | 'work' }
    type: 'post' | 'work'
    data: Post | Work
    linkRef: React.RefObject<HTMLAnchorElement>
  }>

  // Set resources and collections for 3D scene
  useEffect(() => {
    setHeaderTheme('light')
    setTheme('light')
    setResources(cards.map((c) => c.resource))
    setCollections(cards.map((c) => c.collection))

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
  }, [setHeaderTheme, setTheme, cards, setResources, setCollections])

  // For trackedRefs, use the dynamic cards array
  const trackedRefs: SceneTrackRefs = {
    heroSection: heroRef,
    cards: cards.map((c) => c.imageRef),
    banner: bannerRef,
    ctaSection: ctaRef,
  }

  return (
    <div>
      <SceneSetter scene="home" trackedRefs={trackedRefs} />

      <PageTransition>
        <HomeHero />
        {/* <div ref={heroRef}>
          <div className="container mb-16">
            <h2 className="text-accent mb-4 font-mono text-sm uppercase">Works</h2>
            <p ref={paragraphRef} className="text-3xl font-light">
              I help businesses define–or redefine–their brand through a blend of powerfully
              insightful consultative services and creative production.
            </p>
          </div>
        </div> */}

        <section className="container">
          <div className="mb-12 flex gap-12 py-24">
            {cards.map((card, i) => {
              // Map variant to aspect ratio (must match PlaneWithImage)
              const aspectRatios = {
                wide: 16 / 9,
                portrait: 3 / 4,
                square: 1 / 1,
              } as const
              const aspect = aspectRatios[card.resource.variant] ?? aspectRatios.square
              // Alternate widths: 4/12 and 8/12
              const widthClass = i % 2 === 0 ? 'w-4/12' : 'w-8/12'
              return (
                <div key={card.data.slug ?? i} className={`h-full ${widthClass} cursor-pointer`}>
                  <div
                    ref={card.imageRef}
                    className={cn('z-50 w-full', card.type === 'post')}
                    style={{ aspectRatio: `${aspect}` }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      // compute UV: x in [0,1], y inverted so 0=bottom, 1=top
                      const x = (e.clientX - rect.left) / rect.width
                      const y = 1 - (e.clientY - rect.top) / rect.height
                      setMouseUV([x, y])
                    }}
                  ></div>
                  <h2 className="mt-4 text-xl">
                    <Link
                      href={`/${card.type === 'post' ? 'posts' : 'works'}/${card.data.slug}`}
                      ref={card.linkRef}
                      className="not-prose"
                    >
                      {card.data.title}
                    </Link>
                  </h2>
                  <p className="mt-2">{card.data.meta?.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      </PageTransition>
    </div>
  )
}

export default HomeTemplateClient

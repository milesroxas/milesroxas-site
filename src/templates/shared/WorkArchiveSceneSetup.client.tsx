'use client'

import React, { useRef, useEffect } from 'react'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import SceneSetter from '@/r3f/canvas/SceneSetter'
import type { Work } from '@/payload-types'

export default function WorkArchiveSceneSetup({ works }: { works: Work[] }) {
  // create refs for each card image container
  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>(
    works.map(() => React.createRef<HTMLDivElement | null>()),
  )

  const setResources = useSceneStore((s) => s.setResources)
  const setCollections = useSceneStore((s) => s.setCollections)

  useEffect(() => {
    // map works to resource entries
    const resources = works.map((w) => {
      const media = typeof w.hero.media !== 'number' ? w.hero.media : undefined
      return { url: media?.url || '', variant: 'wide' as const }
    })
    // all variants are 'work'
    const collections = works.map(() => ({ variant: 'work' as const }))

    setResources(resources)
    setCollections(collections)
  }, [works, setResources, setCollections])

  // feed refs and scene into store
  return <SceneSetter scene="home" trackedRefs={{ cards: cardRefs.current }} />
}

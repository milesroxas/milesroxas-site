'use client'

import { useEffect } from 'react'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import { getMediaUrl } from '@/utilities/getMediaURL'
import type { Page, ContentBlock } from '@/payload-types'

export default function ContentSceneSetup({ layout }: { layout: Page['layout'] }) {
  const setResources = useSceneStore((s) => s.setResources)
  const setCollections = useSceneStore((s) => s.setCollections)

  useEffect(() => {
    const resources: { url: string; variant: 'wide' | 'portrait' | 'square' }[] = []
    const collections: { variant: 'work' | 'post' }[] = []

    layout.forEach((block) => {
      if (block.blockType === 'content') {
        // block is narrowed to ContentBlock, cast for TS
        const contentBlock = block as ContentBlock
        ;(contentBlock.columns || []).forEach((col) => {
          // for work cards:
          if (
            col.content === 'work' &&
            col.work?.works != null &&
            typeof col.work.works !== 'number'
          ) {
            const workDoc = col.work.works
            const media = workDoc.hero.media
            if (media && typeof media !== 'number' && media.url) {
              const aspectOpt = (col as unknown as { aspect?: string }).aspect
              const variant =
                aspectOpt === 'portrait' ? 'portrait' : aspectOpt === 'square' ? 'square' : 'wide'
              resources.push({ url: getMediaUrl(media) || '', variant })
              collections.push({ variant: 'work' })
            }
          }
          // for post cards:
          if (
            col.content === 'post' &&
            col.post?.posts != null &&
            typeof col.post.posts !== 'number'
          ) {
            const postDoc = col.post.posts
            const media = postDoc.hero.media
            if (media && typeof media !== 'number' && media.url) {
              // determine variant from CMS aspect (wide, portrait, square)
              const aspectOpt = (col as unknown as { aspect?: string }).aspect
              const variant =
                aspectOpt === 'portrait' ? 'portrait' : aspectOpt === 'square' ? 'square' : 'wide'
              resources.push({ url: getMediaUrl(media) || '', variant })
              collections.push({ variant: 'post' })
            }
          }
        })
      }
    })

    setResources(resources)
    setCollections(collections)
  }, [layout, setResources, setCollections])

  return null
}

import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type React from 'react'
import type { CardPostData } from '@/components/Card/Posts/Component'

import type { CardWorkData } from '@/components/Card/Works/Component'
import type { ArchiveBlock as ArchiveBlockProps, Work } from '@/payload-types'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'

import ArchiveBlockClient from './ArchiveBlockClient'
import { flattenCategories, getCategoryFilter } from './utils'

async function fetchPostsByCollection(
  limit: number,
  categoryFilter: ReturnType<typeof getCategoryFilter>,
) {
  const payload = await getPayload({ config: configPromise })
  const fetchedPosts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    ...categoryFilter,
  })
  return fetchedPosts.docs
}

async function fetchWorksByCollection(
  limit: number,
  categoryFilter: ReturnType<typeof getCategoryFilter>,
  hasAccess: boolean,
) {
  const payload = await getPayload({ config: configPromise })
  const fetchedWorks = await payload.find({
    collection: 'works',
    depth: 2,
    limit,
    ...categoryFilter,
  })

  // Replace protected works with fallback if user doesn't have access
  const processedWorks = await Promise.all(
    fetchedWorks.docs.map(async (work) => {
      if (work.isProtected && !hasAccess && work.fallbackWork) {
        // Fetch the fallback work
        const fallbackId =
          typeof work.fallbackWork === 'number' ? work.fallbackWork : work.fallbackWork.id
        const fallbackWork = await payload.findByID({
          collection: 'works',
          id: fallbackId,
          depth: 2,
        })
        return fallbackWork as CardWorkData
      }
      return work as CardWorkData
    }),
  )

  return processedWorks
}

async function getFallbackWork(work: Work): Promise<CardWorkData | null> {
  if (!work.fallbackWork) return null

  const payload = await getPayload({ config: configPromise })
  const fallbackId =
    typeof work.fallbackWork === 'number' ? work.fallbackWork : work.fallbackWork.id

  const fallbackWork = await payload.findByID({
    collection: 'works',
    id: fallbackId,
    depth: 2,
  })

  return fallbackWork as CardWorkData
}

async function processWork(work: Work, hasAccess: boolean): Promise<CardWorkData> {
  const needsFallback = work.isProtected && !hasAccess && work.fallbackWork

  if (needsFallback) {
    const fallback = await getFallbackWork(work)
    return fallback || (work as CardWorkData)
  }

  return work as CardWorkData
}

async function extractSelectedDocs(
  selectedDocs: ArchiveBlockProps['selectedDocs'],
  hasAccess: boolean,
) {
  const posts: CardPostData[] = []
  const works: CardWorkData[] = []

  if (!selectedDocs?.length) {
    return { posts, works }
  }

  for (const doc of selectedDocs) {
    if (typeof doc.value !== 'object') continue

    if (doc.relationTo === 'posts') {
      posts.push(doc.value as CardPostData)
    } else if (doc.relationTo === 'works') {
      const processedWork = await processWork(doc.value as Work, hasAccess)
      works.push(processedWork)
    }
  }

  return { posts, works }
}

export const ArchiveBlock: React.FC<ArchiveBlockProps> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    relationTo = 'posts',
    selectedDocs,
    theme,
  } = props

  const limit = limitFromProps || 3

  // Check if user has access to protected works
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const urlObj = new URL(url, 'http://localhost')
  const hasAccess = hasWorkAccess(urlObj.searchParams)

  let posts: CardPostData[] = []
  let works: CardWorkData[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = flattenCategories(categories)
    const categoryFilter = getCategoryFilter(flattenedCategories)

    if (relationTo === 'posts') {
      posts = await fetchPostsByCollection(limit, categoryFilter)
    } else if (relationTo === 'works') {
      works = await fetchWorksByCollection(limit, categoryFilter, hasAccess)
    }
  } else if (populateBy === 'selection') {
    const extractedDocs = await extractSelectedDocs(selectedDocs, hasAccess)
    posts = extractedDocs.posts
    works = extractedDocs.works
  }

  return (
    <div id={`block-${id}`}>
      <ArchiveBlockClient
        theme={theme}
        introContent={introContent}
        posts={posts}
        works={works}
        cardStyle="card"
      />
    </div>
  )
}

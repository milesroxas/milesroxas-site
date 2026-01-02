import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import type { CardPostData } from '@/components/Card/Posts/Component'

import type { CardWorkData } from '@/components/Card/Works/Component'
import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

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
) {
  const payload = await getPayload({ config: configPromise })
  const fetchedWorks = await payload.find({
    collection: 'works',
    depth: 2,
    limit,
    ...categoryFilter,
  })
  return fetchedWorks.docs
}

function extractSelectedDocs(selectedDocs: ArchiveBlockProps['selectedDocs']) {
  const posts: CardPostData[] = []
  const works: CardWorkData[] = []

  if (!selectedDocs?.length) {
    return { posts, works }
  }

  for (const doc of selectedDocs) {
    if (typeof doc.value === 'object') {
      if (doc.relationTo === 'posts') {
        posts.push(doc.value as CardPostData)
      } else if (doc.relationTo === 'works') {
        works.push(doc.value as CardWorkData)
      }
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

  let posts: CardPostData[] = []
  let works: CardWorkData[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = flattenCategories(categories)
    const categoryFilter = getCategoryFilter(flattenedCategories)

    if (relationTo === 'posts') {
      posts = await fetchPostsByCollection(limit, categoryFilter)
    } else if (relationTo === 'works') {
      works = await fetchWorksByCollection(limit, categoryFilter)
    }
  } else if (populateBy === 'selection') {
    const extractedDocs = extractSelectedDocs(selectedDocs)
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

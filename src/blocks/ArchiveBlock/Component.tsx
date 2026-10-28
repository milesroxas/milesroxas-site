import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import type React from 'react'
import { MEMBERS_TEASER } from '@/access/members'
import type { CardPostData } from '@/components/Card/Posts/Component'

import type { CardWorkData } from '@/components/Card/Works/Component'
import type { ArchiveBlock as ArchiveBlockProps, Work } from '@/payload-types'
import { hasWorkAccess, type WorkAccess } from '@/utilities/checkWorkAccess'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'

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
    // Anonymous read: published posts only, members-only ones as locked cards.
    context: MEMBERS_TEASER,
    overrideAccess: false,
    ...categoryFilter,
  })
  return fetchedPosts.docs
}

async function fetchWorksByCollection(
  limit: number,
  categoryFilter: ReturnType<typeof getCategoryFilter>,
  access: WorkAccess,
) {
  const payload = await getPayload({ config: configPromise })

  const where: Where = {
    ...('where' in categoryFilter ? categoryFilter.where : {}),
    _status: { equals: 'published' },
  }

  // Trusted fetch so protected works can resolve to their fallbacks at render
  // time; the public API is gated by the works read access rule.
  const fetchedWorks = await payload.find({
    collection: 'works',
    depth: 2,
    limit,
    where,
  })

  const processedWorks = await Promise.all(
    fetchedWorks.docs.map((work) => resolveVisibleWork(work, access)),
  )

  return processedWorks.filter((work): work is Work => work !== null) as CardWorkData[]
}

async function extractSelectedDocs(
  selectedDocs: ArchiveBlockProps['selectedDocs'],
  access: WorkAccess,
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
      const visibleWork = await resolveVisibleWork(doc.value as Work, access)
      if (visibleWork) {
        works.push(visibleWork as CardWorkData)
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
      works = await fetchWorksByCollection(limit, categoryFilter, hasWorkAccess)
    }
  } else if (populateBy === 'selection') {
    const extractedDocs = await extractSelectedDocs(selectedDocs, hasWorkAccess)
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

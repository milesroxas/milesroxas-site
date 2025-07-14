import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CardWorkData } from '@/components/Card/Works/Component'
import { CardPostData } from '@/components/Card/Posts/Component'

import ArchiveBlockClient from './ArchiveBlockClient'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    cardStyle: 'card' | 'featured'
  }
> = async (props) => {
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
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    if (relationTo === 'posts') {
      const fetchedPosts = await payload.find({
        collection: 'posts',
        depth: 2,
        limit,
        ...(flattenedCategories && flattenedCategories.length > 0
          ? {
              where: {
                categories: {
                  in: flattenedCategories,
                },
              },
            }
          : {}),
      })

      posts = fetchedPosts.docs
    } else if (relationTo === 'works') {
      const fetchedWorks = await payload.find({
        collection: 'works',
        depth: 2,
        limit,
        ...(flattenedCategories && flattenedCategories.length > 0
          ? {
              where: {
                categories: {
                  in: flattenedCategories,
                },
              },
            }
          : {}),
      })

      works = fetchedWorks.docs
    }
  } else if (populateBy === 'selection' && selectedDocs?.length) {
    selectedDocs.forEach((doc) => {
      if (typeof doc.value === 'object') {
        if (doc.relationTo === 'posts') {
          posts.push(doc.value as CardPostData)
        } else if (doc.relationTo === 'works') {
          works.push(doc.value as CardWorkData)
        }
      }
    })
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

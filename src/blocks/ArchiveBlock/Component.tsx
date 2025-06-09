import type { Post, Work, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { CardWorkData } from '@/components/Card/Works/Component'
import { CardPostData } from '@/components/Card/Posts/Component'
import { CollectionArchive } from '@/components/CollectionArchive'

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
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16 px-8 md:px-14">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} works={works} />
    </div>
  )
}

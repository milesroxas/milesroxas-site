import type { Work, WorksBlock as WorksBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { WorkArchive } from '@/components/WorkArchive'

export const WorksBlock: React.FC<WorksBlockProps & { id?: string }> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let works: Work[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedWorks = await payload.find({
      collection: 'works',
      depth: 1,
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
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedWorks = selectedDocs
        .map((work) => {
          if (typeof work.value === 'object') return work.value
        })
        .filter(Boolean) as Work[]

      works = filteredSelectedWorks
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <WorkArchive works={works} />
    </div>
  )
}

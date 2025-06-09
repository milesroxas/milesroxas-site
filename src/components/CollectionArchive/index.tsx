import { cn } from '@/utilities/ui'
import React from 'react'

import { CardPostData, PostCard } from '@/components/Card/Posts/Component'
import { CardWorkData, WorkCard } from '../Card/Works/Component'

export type Props = {
  posts?: CardPostData[]
  works?: CardWorkData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, works } = props

  return (
    <div className={cn('container px-8 md:px-14')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <PostCard className="h-full" doc={result} relationTo="posts" />
                </div>
              )
            }

            return null
          })}
          {works?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <WorkCard doc={result} relationTo="works" />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}

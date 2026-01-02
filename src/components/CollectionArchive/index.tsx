import type React from 'react'
import { type CardPostData, PostCard } from '@/components/Card/Posts/Component'
import { cn } from '@/utilities/ui'
import { type CardWorkData, WorkCard } from '../Card/Works/Component'

export type Props = {
  posts?: CardPostData[]
  works?: CardWorkData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, works } = props

  return (
    <div className={cn('container px-8 md:px-20')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-20 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {posts?.map((result) => {
            if (typeof result === 'object' && result !== null && result.slug) {
              return (
                <div className="col-span-4" key={`post-${result.slug}`}>
                  <PostCard className="h-full" doc={result} relationTo="posts" />
                </div>
              )
            }

            return null
          })}
          {works?.map((result) => {
            if (typeof result === 'object' && result !== null && result.slug) {
              return (
                <div className="col-span-4" key={`work-${result.slug}`}>
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

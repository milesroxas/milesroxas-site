import { cn } from '@/utilities/ui'
import React from 'react'

import { CardPostData, PostCard } from '@/components/Card/Posts/Component'

export type Props = {
  posts?: CardPostData[]
}

export const PostsArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container px-8 md:px-14 lg:px-20')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <PostCard doc={result} relationTo="posts" />
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

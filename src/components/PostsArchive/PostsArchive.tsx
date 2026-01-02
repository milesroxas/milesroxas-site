import type React from 'react'
import { type CardPostData, PostCard } from '@/components/Card/Posts/Component'
import { postKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'

export type Props = {
  posts?: CardPostData[]
}

export const PostsArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container px-8 md:px-14 lg:px-20')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-20 sm:grid-cols-8 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={postKeys.fromPostArray(result, index)}>
                  <PostCard doc={result} relationTo="posts" index={index} />
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

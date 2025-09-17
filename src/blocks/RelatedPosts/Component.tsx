import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostCard } from '@/components/Card/Posts/Component'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx('text-primary-foreground px-8 py-12 md:px-14 lg:container', className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-4">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null

          return <PostCard key={index} doc={doc} relationTo="posts" />
        })}
      </div>
    </div>
  )
}

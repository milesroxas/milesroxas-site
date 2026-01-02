import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import clsx from 'clsx'
import type React from 'react'
import { PostCard } from '@/components/Card/Posts/Component'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { postKeys } from '@/utilities/reactKeyDomains'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx('px-8 py-12 text-primary-foreground lg:container md:px-14', className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-4">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null

          return <PostCard key={postKeys.fromPost(doc, index)} doc={doc} relationTo="posts" />
        })}
      </div>
    </div>
  )
}

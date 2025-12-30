'use client'

import type React from 'react'
import type { CardPostData } from '@/components/Card/Posts/Component'
import { PostsArchive } from '@/components/PostsArchive/PostsArchive'

interface PostsClientProps {
  posts: CardPostData[]
}

const PageNumberClient: React.FC<PostsClientProps> = ({ posts }) => {
  return <PostsArchive posts={posts} />
}

export default PageNumberClient

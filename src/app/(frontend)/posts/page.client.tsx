'use client'

import React from 'react'
import { CardPostData } from '@/components/Card/Posts/Component'
import { PostsArchive } from '@/components/PostsArchive/PostsArchive'

interface PostsClientProps {
  posts: CardPostData[]
}

const PostsClient: React.FC<PostsClientProps> = ({ posts }) => {
  return <PostsArchive posts={posts} />
}

export default PostsClient

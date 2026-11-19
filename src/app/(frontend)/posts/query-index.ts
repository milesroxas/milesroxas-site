import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { PostsIndex } from '@/payload-types'
import { POSTS_INDEX_DEFAULTS } from '@/shared/content/postsIndex'
import { getCachedGlobal } from '@/utilities/getGlobals'

/** The Posts index global; null until it is first published, so the defaults stand in. */
export const queryPostsIndex = cache(async (): Promise<PostsIndex | null> => {
  const { isEnabled: draft } = await draftMode()

  if (draft) {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'posts-index', depth: 1, draft: true })
  }

  const index = (await getCachedGlobal('posts-index', 1)()) as PostsIndex
  return index?._status === 'published' ? index : null
})

export const postsIndexTitle = (index: PostsIndex | null): string =>
  index?.title || POSTS_INDEX_DEFAULTS.heading

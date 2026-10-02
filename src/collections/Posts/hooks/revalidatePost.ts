import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Post } from '../../../payload-types'

// The paginated posts index is ISR-cached; bust it alongside the tags
const revalidatePostsIndex = () => {
  revalidatePath('/posts')
  revalidatePath('/posts/page/[pageNumber]', 'page')
  revalidateTag('posts-sitemap', 'max')
  revalidateTag('posts', 'max')
}

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  revalidateDocument<Post>({
    noun: 'post',
    pathFor: (slug) => `/posts/${slug}`,
    revalidateLists: revalidatePostsIndex,
  })

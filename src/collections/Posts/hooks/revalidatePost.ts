import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Post } from '../../../payload-types'

// The paginated posts index is ISR-cached; bust it alongside the tag.
// Every post closes on other posts (More posts), so every post page goes too.
// The sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
const revalidatePostsIndex = () => {
  revalidatePath('/posts')
  revalidatePath('/posts/page/[pageNumber]', 'page')
  revalidatePath('/posts/[slug]', 'page')
  revalidateTag('posts', 'max')
}

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  revalidateDocument<Post>({
    noun: 'post',
    pathFor: (slug) => `/posts/${slug}`,
    revalidateLists: revalidatePostsIndex,
  })

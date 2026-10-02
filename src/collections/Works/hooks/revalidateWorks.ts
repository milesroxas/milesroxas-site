import { revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Work } from '@/payload-types'

export const { afterChange: revalidateWork, afterDelete: revalidateDelete } =
  revalidateDocument<Work>({
    noun: 'work',
    pathFor: (slug) => `/works/${slug}`,
    revalidateLists: () => {
      revalidateTag('works-sitemap', 'max')
      revalidateTag('works', 'max')
    },
  })

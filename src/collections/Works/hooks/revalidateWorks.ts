import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Work } from '@/payload-types'

export const { afterChange: revalidateWork, afterDelete: revalidateDelete } =
  revalidateDocument<Work>({
    noun: 'work',
    pathFor: (slug) => `/works/${slug}`,
    // The sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
    revalidateLists: () => {
      revalidatePath('/works')
      revalidateTag('works', 'max')
    },
  })

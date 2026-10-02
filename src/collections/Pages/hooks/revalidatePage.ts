import { revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Page } from '../../../payload-types'

export const { afterChange: revalidatePage, afterDelete: revalidateDelete } =
  revalidateDocument<Page>({
    noun: 'page',
    pathFor: (slug) => (slug === 'home' ? '/' : `/${slug}`),
    revalidateLists: () => revalidateTag('pages-sitemap', 'max'),
  })

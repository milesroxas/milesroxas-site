import { revalidateDocument } from '@/collections/shared/revalidateDocument'
import type { Page } from '../../../payload-types'

// No list of its own: the sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
export const { afterChange: revalidatePage, afterDelete: revalidateDelete } =
  revalidateDocument<Page>({
    noun: 'page',
    pathFor: (slug) => (slug === 'home' ? '/' : `/${slug}`),
    revalidateLists: () => {},
  })

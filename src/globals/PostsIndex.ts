import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { seoTab } from '@/collections/shared/seoTab'
import { POSTS_INDEX_DEFAULTS } from '@/shared/content/postsIndex'
import { generateGlobalPreviewPath } from '@/utilities/generatePreviewPath'
import { revalidatePublishedGlobal } from './revalidateGlobal'

const PATH = POSTS_INDEX_DEFAULTS.path

/**
 * The landing page at /posts, the same shape as the Works index: the heading
 * and SEO are edited here, the list of posts stays automatic (newest first).
 */
export const PostsIndex: GlobalConfig = {
  slug: 'posts-index',
  label: 'Posts index',
  admin: {
    description: 'The posts landing page at /posts. Heading and SEO: the list is automatic.',
    livePreview: {
      url: () => generateGlobalPreviewPath({ global: 'posts-index', path: PATH }),
    },
    preview: () => generateGlobalPreviewPath({ global: 'posts-index', path: PATH }),
  },
  access: {
    read: () => true,
    update: authenticated,
    readVersions: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Copy',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: POSTS_INDEX_DEFAULTS.heading,
              admin: { description: 'The heading above the list.' },
            },
          ],
        },
        seoTab(),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidatePublishedGlobal('posts-index', PATH)],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    max: 50,
  },
}

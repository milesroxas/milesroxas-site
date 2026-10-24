import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { seoTab } from '@/collections/shared/seoTab'
import { WORKS_INDEX_DEFAULTS } from '@/shared/content/worksIndex'
import { generateGlobalPreviewPath } from '@/utilities/generatePreviewPath'
import { revalidatePublishedGlobal } from './revalidateGlobal'

const PATH = '/works'

/**
 * The landing page at /works, ported from sas-site's collection index globals:
 * the heading, lead and SEO are edited here, the list of works stays automatic
 * (published works in the Works collection's order).
 */
export const WorksIndex: GlobalConfig = {
  slug: 'works-index',
  label: 'Works index',
  admin: {
    description: 'The works landing page at /works. Heading, lead and SEO: the list is automatic.',
    livePreview: {
      url: () => generateGlobalPreviewPath({ global: 'works-index', path: PATH }),
    },
    preview: () => generateGlobalPreviewPath({ global: 'works-index', path: PATH }),
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
              defaultValue: WORKS_INDEX_DEFAULTS.heading,
              admin: { description: 'The heading above the list.' },
            },
            {
              name: 'lead',
              type: 'textarea',
              admin: { description: 'Optional. One or two sentences under the heading.' },
            },
          ],
        },
        seoTab(),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidatePublishedGlobal('works-index', PATH)],
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

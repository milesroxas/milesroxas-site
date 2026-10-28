import type { CollectionConfig } from 'payload'
import { publishedContentRead } from '@/access/members'
import { seoTab } from '@/collections/shared/seoTab'
import { contentsButtonField, pageLayoutField } from '@/fields/pageFields'
import { slugField } from '@/fields/slug'
import { visibilityField } from '@/fields/visibility'
import { heroField } from '@/heros/config'
import { authenticated } from '../../access/authenticated'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage, revalidateUnpublish } from './hooks/revalidatePage'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedContentRead(),
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
        }),
    },
    preview: (data) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [heroField()],
          label: 'Opening',
        },
        {
          fields: [pageLayoutField(), contentsButtonField()],
          label: 'Composition',
        },
        seoTab(),
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    visibilityField(),
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterOperation: [revalidateUnpublish],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Industry standard: autosave every 2 seconds
      },
    },
    maxPerDoc: 50,
  },
}

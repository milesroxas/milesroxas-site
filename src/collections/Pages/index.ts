import type { CollectionConfig } from 'payload'
import { seoTab } from '@/collections/shared/seoTab'
import { contentsButtonField } from '@/fields/pageFields'
import { pageLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { slugField } from '@/fields/slug'
import { heroField } from '@/heros/config'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
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
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: pageLayoutBlocks,
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
            contentsButtonField(),
          ],
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
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Industry standard: autosave every 2 seconds
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

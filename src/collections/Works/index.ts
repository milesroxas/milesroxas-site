import type { CollectionConfig } from 'payload'
import { seoTab } from '@/collections/shared/seoTab'
import { contentsButtonField } from '@/fields/pageFields'
import { pageIntroField } from '@/fields/pageHero'
import { workLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { slugField } from '@/fields/slug'
import { workHeroField } from '@/heros/WorkHero/config'
import { authenticated } from '../../access/authenticated'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { worksReadAccess } from './access'
import { revalidateDelete, revalidateWork } from './hooks/revalidateWorks'

export const Works: CollectionConfig<'works'> = {
  slug: 'works',
  access: {
    create: authenticated,
    delete: authenticated,
    read: worksReadAccess,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
    hero: {
      media: true,
    },
    meta: {
      image: true,
      description: true,
    },
    isProtected: true,
    fallbackWork: true,
    // resolveVisibleWork hides a referenced work that is not published.
    _status: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_order', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'works',
        }),
    },
    preview: (data) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'works',
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
          fields: [
            workHeroField(),
            {
              name: 'client',
              type: 'relationship',
              relationTo: 'clients',
              admin: {
                description:
                  'Shown above the title as "<Client> Case Study". Pick a client, or add a new one here.',
                sortOptions: 'title',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'industry',
                  label: 'Industry',
                  type: 'text',
                },
                {
                  name: 'role',
                  label: 'Role',
                  type: 'text',
                },
              ],
            },
            {
              name: 'capabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
              admin: {
                description:
                  'Listed in the hero in this order: drag to reorder. Pick a capability, or add a new one here.',
                isSortable: true,
              },
            },
            pageIntroField(),
          ],
          label: 'Opening',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: workLayoutBlocks,
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
            contentsButtonField(),
          ],
          label: 'Composition',
        },
        {
          fields: [
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              enumName: 'enum_works_project_status',
              options: [
                {
                  label: 'Coming Soon',
                  value: 'coming-soon',
                },
                {
                  label: 'Live',
                  value: 'live',
                },
              ],
            },
          ],
          label: 'Status',
        },
        {
          fields: [
            {
              name: 'isProtected',
              type: 'checkbox',
              label: 'Protected Work',
              defaultValue: false,
              admin: {
                description: 'Requires query param to access this work',
              },
            },
            {
              name: 'fallbackWork',
              type: 'relationship',
              relationTo: 'works',
              label: 'Fallback Work',
              admin: {
                condition: (data) => data?.isProtected === true,
                description: 'Public work to display when user does not have access',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                  isProtected: {
                    not_equals: true,
                  },
                }
              },
            },
          ],
          label: 'Access Control',
        },
        {
          fields: [
            {
              name: 'relatedWorks',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'works',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Related & Categories',
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
    afterChange: [revalidateWork],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  orderable: true,
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

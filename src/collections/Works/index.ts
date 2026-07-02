import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { hero } from '@/heros/config'
import { authenticated } from '../../access/authenticated'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { SliderBlock } from '../../blocks/Slider/config'
import { TabsBlock } from '../../blocks/Tabs/config'
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                SliderBlock,
                TabsBlock,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
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
            {
              name: 'deliverables',
              label: 'Deliverables',
              type: 'text',
            },
          ],
          label: 'Work Details',
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
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'No Index',
              defaultValue: false,
              admin: {
                description: 'Prevent search engines from indexing this page',
              },
            },
          ],
        },
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

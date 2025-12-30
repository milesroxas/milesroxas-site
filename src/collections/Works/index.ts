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
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { SliderBlock } from '../../blocks/Slider/config'
import { TabsBlock } from '../../blocks/Tabs/config'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateWork } from './hooks/revalidateWorks'

export const Works: CollectionConfig<'works'> = {
  slug: 'works',
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
    hero: {
      media: true,
    },
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', '_order', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'works',
          req,
        })
        console.log('Preview URL for works:', path)

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'works',
        req,
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
              name: 'isPasswordProtected',
              type: 'checkbox',
              label: 'Password Protected',
              defaultValue: false,
              admin: {
                description: 'Enable password protection for this work',
              },
            },
            {
              name: 'password',
              type: 'text',
              label: 'Access Password',
              admin: {
                condition: (data) => data?.isPasswordProtected === true,
                description: 'Set a password to access this work',
              },
              access: {
                read: ({ req: { user } }) => Boolean(user),
              },
            },
          ],
          label: 'Password Protection',
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
        interval: 1000,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

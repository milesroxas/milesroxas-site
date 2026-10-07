import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Banner } from '@/blocks/Banner/config'

import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { seoTab } from '@/collections/shared/seoTab'
import { contentsButtonField } from '@/fields/pageFields'
import { pageIntroField } from '@/fields/pageHero'
import { postLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { slugField } from '@/fields/slug'
import { heroField } from '@/heros/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { postCardSelect } from './cardSelect'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { externalField, showsBody, sourceField } from './source'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: postCardSelect,
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
        }),
    },
    preview: (data) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    externalField(),
    {
      type: 'tabs',
      tabs: [
        {
          fields: [heroField({ editorial: true }), pageIntroField()],
          label: 'Opening',
        },
        {
          fields: [
            contentsButtonField(),
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    // h5 stays enabled for the bodies that already use it: publishing
                    // revalidates the body, and a level the editor dropped fails it.
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              // Optional since the composer port (docs/composer-roadmap.md,
              // D5): a post can be composed from Sections alone.
            },
          ],
          label: 'Content',
          admin: { condition: showsBody },
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: postLayoutBlocks,
              admin: {
                initCollapsed: true,
                description:
                  'Sections after the article body. The route renders the body, then these.',
              },
            },
          ],
          label: 'Composition',
          admin: { condition: showsBody },
        },
        {
          fields: [
            {
              name: 'relatedPosts',
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
              relationTo: 'posts',
            },
            {
              name: 'hideRelatedPosts',
              type: 'checkbox',
              label: 'Hide related posts',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description: 'Leaves the "More posts" rail off the end of this post.',
              },
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
    sourceField(),
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
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

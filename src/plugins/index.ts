import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { aeoPlugin } from '@/plugins/aeo'
import { askIndexPlugin } from '@/plugins/ask-index'
import { figuresPlugin } from '@/plugins/figures'
import { mcp } from '@/plugins/mcp'
import { seo } from '@/plugins/seo'
import { streakStudioPlugin } from '@/plugins/streak-studio'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { SEARCH_COLLECTIONS } from '@/shared/content/surfaces'

export const plugins: Plugin[] = [
  streakStudioPlugin(),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // Plugin default leaves write ops at Payload's `Boolean(req.user)`,
      // which an MCP API key satisfies over REST. Restrict writes to team.
      access: {
        create: authenticated,
        delete: authenticated,
        update: authenticated,
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seo,
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    // Same `Boolean(req.user)` defaults as above: team-only writes, so an MCP
    // key over REST cannot edit a form or delete what visitors submitted.
    formSubmissionOverrides: {
      access: { delete: authenticated },
    },
    formOverrides: {
      access: {
        create: authenticated,
        delete: authenticated,
        update: authenticated,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    // Every public surface (shared/content/surfaces.ts): the Ask keyword
    // fallback reads this index. The /search page still lists posts only.
    collections: SEARCH_COLLECTIONS,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      // Derived index: writable by the sync hooks (Local API) and team only.
      access: {
        delete: authenticated,
        update: authenticated,
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // Validates every figure spec and computes diagram geometry on save
  // (docs/figures.md). Hooks only the collections that offer a figure block.
  figuresPlugin(),
  // Agent authoring server at /api/mcp (docs/mcp.md). Full config
  // (collections, globals, capability policy, block tools) lives in ./mcp.
  mcp,
  // llms.txt, the sitemap and IndexNow follow publishes (docs/aeo.md).
  aeoPlugin(),
  // Last: it hooks the collections and globals every plugin above has added.
  askIndexPlugin(),
]

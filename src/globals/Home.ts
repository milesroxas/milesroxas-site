import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { seoTab } from '@/collections/shared/seoTab'
import { pageLayoutField } from '@/fields/pageFields'
import { homeHeroField } from '@/heros/HomeHero/config'
import { populateGlobalPublishedAt } from '@/hooks/populatePublishedAt'
import { HOME_SURFACE } from '@/shared/content/surfaces'
import { generateGlobalPreviewPath } from '@/utilities/generatePreviewPath'
import { revalidatePublishedGlobal } from './revalidateGlobal'

const preview = () =>
  generateGlobalPreviewPath({ global: HOME_SURFACE.global, path: HOME_SURFACE.path })

/**
 * The home page at `/`, ported from sas-site's Home global: a page with one
 * opening (`HomeHero`) instead of a choice of heroes, composed from the same
 * blocks as Pages. The h1 is Site Info's name and role (`homeHeading`).
 */
export const Home: GlobalConfig = {
  slug: HOME_SURFACE.global,
  label: 'Home',
  admin: {
    description: 'The home page at /: the portrait opening, the sections under it, and SEO.',
    livePreview: { url: preview },
    preview,
  },
  access: {
    read: () => true,
    update: authenticated,
    readVersions: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: HOME_SURFACE.title,
      admin: {
        description: 'Names the page in listings. The page heading is Site Info’s name and role.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [homeHeroField()],
          label: 'Opening',
        },
        {
          fields: [pageLayoutField()],
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
  ],
  hooks: {
    afterChange: [revalidatePublishedGlobal(HOME_SURFACE.global, HOME_SURFACE.path)],
    beforeChange: [populateGlobalPublishedAt],
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

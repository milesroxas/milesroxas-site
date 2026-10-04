import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** The organizations a work was made for. A work names one in its hero eyebrow. */
export const Clients: CollectionConfig<'clients'> = {
  slug: 'clients',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Name',
      required: true,
      unique: true,
    },
    ...slugField(),
  ],
}

import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

// The works index caches each work's capability names under the `works` tag.
const revalidateWorks: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateTag('works', 'max')
  return doc
}

/** The kinds of work a case study lists in its hero. Drag rows to set the taxonomy's order. */
export const Capabilities: CollectionConfig<'capabilities'> = {
  slug: 'capabilities',
  labels: { singular: 'Capability', plural: 'Capabilities' },
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
  defaultSort: '_order',
  orderable: true,
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
  hooks: {
    afterChange: [revalidateWorks],
    afterDelete: [revalidateWorks],
  },
}

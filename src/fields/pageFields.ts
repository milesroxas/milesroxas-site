import type { BlocksField, CheckboxField } from 'payload'
import { pageLayoutBlocks } from '@/fields/pageLayoutBlocks'

/** The section list of a page: Pages and the Home global compose from the same blocks. */
export const pageLayoutField = (): BlocksField => ({
  name: 'layout',
  type: 'blocks',
  label: 'Composition',
  labels: { singular: 'Section', plural: 'Sections' },
  blocks: pageLayoutBlocks,
  required: true,
  admin: {
    initCollapsed: true,
  },
})

/** Opt-in floating Contents button (`features/contents`), ported from sas-site. */
export const contentsButtonField = (): CheckboxField => ({
  name: 'showContents',
  type: 'checkbox',
  label: 'Contents button',
  defaultValue: false,
  admin: {
    description:
      'Adds a floating Contents button that lists the section headings on this page and jumps between them. Pages with fewer than three section headings never show it.',
  },
})

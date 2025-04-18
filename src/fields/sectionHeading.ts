import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type SectionHeadingStyle = 'default' | 'center'

export const headingOptions: Record<SectionHeadingStyle, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  center: {
    label: 'Center',
    value: 'center',
  },
}

type SectionHeadingType = (options?: { overrides?: Partial<GroupField> }) => Field

export const sectionHeading: SectionHeadingType = ({ overrides = {} } = {}) => {
  const generatedSectionHeading: Field = {
    name: 'heading',
    type: 'group',
    fields: [
      {
        name: 'style',
        type: 'select',
        options: Object.values(headingOptions),
        defaultValue: 'default',
      },
      {
        name: 'eyebrow',
        type: 'text',
      },
      {
        name: 'heading',
        type: 'text',
      },
      {
        name: 'subheading',
        type: 'text',
      },
    ],
  }
  return deepMerge(generatedSectionHeading, overrides)
}

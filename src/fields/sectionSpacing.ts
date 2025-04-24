import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type SpacingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export const spacingOptions: Record<SpacingSize, { label: string; value: string }> = {
  none: {
    label: 'None',
    value: 'none',
  },
  sm: {
    label: 'Small',
    value: 'sm',
  },
  md: {
    label: 'Medium',
    value: 'md',
  },
  lg: {
    label: 'Large',
    value: 'lg',
  },
  xl: {
    label: 'Extra Large',
    value: 'xl',
  },
}

type SectionSpacingType = (options?: {
  disablePadding?: boolean
  disableMargin?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const sectionSpacing: SectionSpacingType = ({
  disablePadding = false,
  disableMargin = false,
  overrides = {},
} = {}) => {
  const spacingResult: GroupField = {
    name: 'space',
    label: 'Spacing',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [],
  }

  if (!disablePadding) {
    spacingResult.fields.push({
      name: 'pt',
      type: 'select',
      label: 'Top Padding',
      defaultValue: 'md',
      options: Object.values(spacingOptions),
    })

    spacingResult.fields.push({
      name: 'pb',
      type: 'select',
      label: 'Bottom Padding',
      defaultValue: 'md',
      options: Object.values(spacingOptions),
    })
  }

  if (!disableMargin) {
    spacingResult.fields.push({
      name: 'mt',
      type: 'select',
      label: 'Top Margin',
      defaultValue: 'none',
      options: Object.values(spacingOptions),
    })

    spacingResult.fields.push({
      name: 'mb',
      type: 'select',
      label: 'Bottom Margin',
      defaultValue: 'none',
      options: Object.values(spacingOptions),
    })
  }

  return deepMerge(spacingResult, overrides)
}

import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'

import { OptionSelectField } from '../shared'
import type { ControlledFieldProps } from '../types'

export const Select: React.FC<SelectField & ControlledFieldProps> = ({ placeholder, ...props }) => (
  <OptionSelectField {...props} placeholder={placeholder ?? 'Select an option'} />
)

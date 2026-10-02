import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'

import { TextInputField } from '../shared'
import type { RegisterFieldProps } from '../types'

export const Text: React.FC<TextField & RegisterFieldProps> = (props) => (
  <TextInputField {...props} rules={{ required: props.required }} />
)

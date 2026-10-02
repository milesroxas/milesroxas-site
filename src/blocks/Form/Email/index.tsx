import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'

import { TextInputField } from '../shared'
import type { RegisterFieldProps } from '../types'

export const Email: React.FC<EmailField & RegisterFieldProps> = (props) => (
  <TextInputField {...props} rules={{ pattern: /^\S[^\s@]*@\S+$/, required: props.required }} />
)

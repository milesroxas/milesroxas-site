import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'

import { OptionSelectField } from '../shared'
import type { ControlledFieldProps } from '../types'
import { stateOptions } from './options'

export const State: React.FC<StateField & ControlledFieldProps> = (props) => (
  <OptionSelectField {...props} options={stateOptions} placeholder="Select a state" />
)

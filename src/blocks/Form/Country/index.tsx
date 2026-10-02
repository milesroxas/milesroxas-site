import type { CountryField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'

import { OptionSelectField } from '../shared'
import type { ControlledFieldProps } from '../types'
import { countryOptions } from './options'

export const Country: React.FC<CountryField & ControlledFieldProps> = (props) => (
  <OptionSelectField {...props} options={countryOptions} placeholder="Select a country" />
)

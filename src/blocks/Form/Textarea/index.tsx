import type { TextAreaField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { Textarea as TextAreaComponent } from '@/components/ui/legacy-textarea'

import { FormError } from '../Error'
import { FieldLabel } from '../shared'
import type { RegisterFieldProps } from '../types'
import { Width } from '../Width'

export const Textarea: React.FC<
  TextAreaField &
    RegisterFieldProps & {
      rows?: number
    }
> = ({ name, defaultValue, errors, label, register, required, rows = 3, width }) => {
  return (
    <Width width={width}>
      <FieldLabel label={label} name={name} required={required} />

      <TextAreaComponent
        defaultValue={defaultValue}
        id={name}
        placeholder={label ?? ''}
        rows={rows}
        {...register(name, { required: required })}
      />

      {errors[name] && <FormError name={name} />}
    </Width>
  )
}

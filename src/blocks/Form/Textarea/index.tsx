import type { TextAreaField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'

import { FormError } from '../Error'
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
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>

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

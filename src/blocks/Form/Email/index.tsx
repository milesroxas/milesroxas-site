import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { FormError } from '../Error'
import type { RegisterFieldProps } from '../types'
import { Width } from '../Width'

export const Email: React.FC<EmailField & RegisterFieldProps> = ({
  name,
  defaultValue,
  errors,
  label,
  register,
  required,
  width,
}) => {
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
      <Input
        defaultValue={defaultValue}
        id={name}
        type="text"
        {...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
      />

      {errors[name] && <FormError name={name} />}
    </Width>
  )
}

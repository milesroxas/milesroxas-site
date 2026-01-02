import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { useFormContext } from 'react-hook-form'
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { FormError } from '../Error'
import type { RegisterFieldProps } from '../types'
import { Width } from '../Width'

export const Checkbox: React.FC<CheckboxField & RegisterFieldProps> = ({
  name,
  defaultValue,
  errors,
  label,
  register,
  required,
  width,
}) => {
  const props = register(name, { required: required })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <Label htmlFor={name}>
          {required && (
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          )}
          {label}
        </Label>
      </div>
      {errors[name] && <FormError name={name} />}
    </Width>
  )
}

import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FormError } from '../Error'
import type { ControlledFieldProps } from '../types'
import { Width } from '../Width'

export const Select: React.FC<SelectField & ControlledFieldProps> = ({
  name,
  control,
  errors,
  label,
  options,
  placeholder,
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
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = options.find((t) => t.value === value)

          return (
            <SelectComponent onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
              <SelectTrigger className="w-full" id={name}>
                <SelectValue placeholder={placeholder ?? 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
          )
        }}
        rules={{ required }}
      />
      {errors[name] && <FormError name={name} />}
    </Width>
  )
}

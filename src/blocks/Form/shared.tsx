import type { SelectFieldOption } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { Controller, type FieldValues, type RegisterOptions } from 'react-hook-form'
import { Input } from '@/components/ui/legacy-input'
import { Label } from '@/components/ui/legacy-label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/legacy-select'

import { FormError } from './Error'
import type { ControlledFieldProps, RegisterFieldProps } from './types'
import { Width } from './Width'

type BaseFieldProps = {
  label?: string
  name: string
  required?: boolean
  width?: number
}

export const RequiredMark: React.FC = () => (
  <span className="required">
    * <span className="sr-only">(required)</span>
  </span>
)

export const FieldLabel: React.FC<Omit<BaseFieldProps, 'width'>> = ({ label, name, required }) => (
  <Label htmlFor={name}>
    {label}
    {required && <RequiredMark />}
  </Label>
)

export const TextInputField: React.FC<
  BaseFieldProps &
    RegisterFieldProps & {
      defaultValue?: string
      rules: RegisterOptions<FieldValues, string>
    }
> = ({ name, defaultValue, errors, label, register, required, rules, width }) => (
  <Width width={width}>
    <FieldLabel label={label} name={name} required={required} />
    <Input
      defaultValue={defaultValue}
      id={name}
      placeholder={label ?? ''}
      type="text"
      {...register(name, rules)}
    />
    {errors[name] && <FormError name={name} />}
  </Width>
)

export const OptionSelectField: React.FC<
  BaseFieldProps &
    ControlledFieldProps & {
      options: SelectFieldOption[]
      placeholder: string
    }
> = ({ name, control, errors, label, options, placeholder, required, width }) => (
  <Width width={width}>
    <FieldLabel label={label} name={name} required={required} />
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({ field: { onChange, value } }) => {
        const controlledValue = options.find((t) => t.value === value)

        return (
          <Select onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
            <SelectTrigger className="w-full" id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }}
      rules={{ required }}
    />
    {errors[name] && <FormError name={name} />}
  </Width>
)

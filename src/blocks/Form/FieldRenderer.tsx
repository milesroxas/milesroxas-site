import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { Control, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

import { Checkbox } from './Checkbox'
import { Country } from './Country'
import { Email } from './Email'
import { Message } from './Message'
import { Select } from './Select'
import { State } from './State'
import { Text } from './Text'
import { Textarea } from './Textarea'

interface FieldRendererProps {
  field: FormFieldBlock
  control: Control<FieldValues>
  errors: FieldErrors<FieldValues>
  register: UseFormRegister<FieldValues>
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  control,
  errors,
  register,
}) => {
  switch (field.blockType) {
    case 'text':
      return <Text {...field} errors={errors} register={register} />

    case 'email':
      return <Email {...field} errors={errors} register={register} />

    case 'textarea':
      return <Textarea {...field} errors={errors} register={register} />

    case 'checkbox':
      return <Checkbox {...field} errors={errors} register={register} />

    case 'select':
      return <Select {...field} control={control} errors={errors} />

    case 'country':
      return <Country {...field} control={control} errors={errors} />

    case 'state':
      return <State {...field} control={control} errors={errors} />

    case 'message':
      return <Message {...field} />

    case 'date':
    case 'radio':
    case 'payment':
      // These field types are defined in FormFieldBlock but not implemented yet
      console.warn(`Field type "${field.blockType}" is not yet implemented`)
      return null

    default: {
      // TypeScript exhaustiveness check
      const _exhaustiveCheck: never = field
      return null
    }
  }
}

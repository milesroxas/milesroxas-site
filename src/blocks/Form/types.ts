import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

// Props for fields using register (text, email, number, textarea, checkbox)
export interface RegisterFieldProps {
  errors: FieldErrors<FieldValues>
  register: UseFormRegister<FieldValues>
}

// Props for fields using Controller (select, country, state)
export interface ControlledFieldProps {
  control: Control<FieldValues>
  errors: FieldErrors<FieldValues>
}

// Submission data structure
export interface FormSubmissionData {
  field: string
  value: unknown
}

// Error state structure
export interface FormErrorState {
  message: string
  status?: string
}

// Form submission response
export interface FormSubmissionResponse {
  errors?: Array<{ message: string }>
  status?: string
}

// Helper type for field width
export type FieldWidth = number | string | undefined

// Row structure for layout
export type FieldRow = FormFieldBlock[]

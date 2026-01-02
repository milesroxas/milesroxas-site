import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

// Base field props that all form fields receive
export interface BaseFieldProps {
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
  control?: Control<FieldValues>
  form?: unknown
}

// Type for the fields object mapping block types to components
export type FormFieldComponent = React.FC<FormFieldBlock & BaseFieldProps>

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

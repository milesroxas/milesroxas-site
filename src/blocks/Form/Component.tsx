'use client'
import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useCallback, useState } from 'react'
import {
  type Control,
  type FieldErrors,
  type FieldValues,
  FormProvider,
  type UseFormRegister,
  useForm,
} from 'react-hook-form'
import RichText from '@/components/RichText/LegacyBase'
import { Button } from '@/components/ui/legacy-button'
import { type SpaceProps, useSpacing } from '@/hooks/useSpacing'
import type { Form as GeneratedForm, FormBlock as PayloadFormBlock } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'
import { FieldRenderer } from './FieldRenderer'
import type { FormErrorState, FormSubmissionResponse } from './types'
import {
  generateFieldKey,
  generateRowKey,
  groupFieldsIntoRows,
  isFieldFullWidth,
  transformFormDataForSubmission,
} from './utils'

type ConfirmationType = 'message' | 'redirect' | undefined

const resolveForm = (formFromProps: PayloadFormBlock['form']) => {
  const formObject =
    typeof formFromProps === 'object' && formFromProps
      ? (formFromProps as GeneratedForm)
      : undefined

  const formID =
    typeof formFromProps === 'object'
      ? (formFromProps as GeneratedForm).id
      : (formFromProps as number | undefined)

  return {
    confirmationMessage: formObject?.confirmationMessage as DefaultTypedEditorState | undefined,
    confirmationType: formObject?.confirmationType as ConfirmationType,
    formID,
    formObject,
    redirect: formObject?.redirect,
    submitButtonLabel: formObject?.submitButtonLabel,
  }
}

/** Posts a submission; resolves to the error to show when the server refuses it. */
const postFormSubmission = async (
  formID: number | undefined,
  submissionData: ReturnType<typeof transformFormDataForSubmission>,
): Promise<FormErrorState | undefined> => {
  const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
    body: JSON.stringify({
      form: formID,
      submissionData,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const res = (await req.json()) as FormSubmissionResponse
  if (req.status >= 400) {
    return {
      message: res.errors?.[0]?.message || 'Internal Server Error',
      status: res.status,
    }
  }
  return undefined
}

const useFormSubmit = ({
  confirmationType,
  formID,
  redirect,
}: Pick<ReturnType<typeof resolveForm>, 'confirmationType' | 'formID' | 'redirect'>) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<FormErrorState | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: Record<string, unknown>) => {
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = transformFormDataForSubmission(data)

        // delay loading indicator by 1s
        const loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const failure = await postFormSubmission(formID, dataToSend)

          clearTimeout(loadingTimerID)
          setIsLoading(false)

          if (failure) {
            setError(failure)
            return
          }

          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect?.url) router.push(redirect.url)
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return { error, hasSubmitted, isLoading, onSubmit }
}

const FormStatus: React.FC<{
  confirmationMessage?: DefaultTypedEditorState
  confirmationType: ConfirmationType
  error?: FormErrorState
  hasSubmitted?: boolean
  isLoading: boolean
}> = ({ confirmationMessage, confirmationType, error, hasSubmitted, isLoading }) => (
  <>
    {!isLoading && hasSubmitted && confirmationType === 'message' && confirmationMessage && (
      <RichText data={confirmationMessage} />
    )}
    {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
    {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
  </>
)

const FormFieldRows: React.FC<{
  control: Control<FieldValues>
  errors: FieldErrors<FieldValues>
  fields: FormFieldBlock[]
  register: UseFormRegister<FieldValues>
}> = ({ control, errors, fields, register }) => (
  <>
    {groupFieldsIntoRows(fields).map((row, rowIndex) => (
      <div key={generateRowKey(row, rowIndex)} className="mb-6 grid grid-cols-2 gap-4 last:mb-0">
        {row.map((field, fieldIndex) => (
          <div
            key={generateFieldKey(field, rowIndex, fieldIndex)}
            className={isFieldFullWidth(field) ? 'col-span-2' : 'col-span-1'}
          >
            <FieldRenderer field={field} control={control} errors={errors} register={register} />
          </div>
        ))}
      </div>
    ))}
  </>
)

const FormIntro: React.FC<{
  align: PayloadFormBlock['introAlign']
  content: NonNullable<PayloadFormBlock['introContent']>
}> = ({ align, content }) => (
  <div
    className={cn('mb-8 lg:mb-12', {
      'text-center': align === 'center',
      'text-left': align === 'left',
    })}
  >
    <RichText className="max-w-none" data={content} enableGutter={false} />
  </div>
)

export const FormBlock: React.FC<PayloadFormBlock> = (props) => {
  const {
    enableIntro = false,
    form: formFromProps,
    introAlign = 'left',
    introContent,
    space,
  } = props

  const spacingStyles = useSpacing(space as SpaceProps | undefined)

  const form = resolveForm(formFromProps)

  const formMethods = useForm()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const { error, hasSubmitted, isLoading, onSubmit } = useFormSubmit(form)

  const formDomID = form.formID ? String(form.formID) : undefined

  return (
    <div className="w-full font-light">
      <div style={spacingStyles} className="bg-background text-foreground">
        <div className="container px-8 md:px-14 lg:px-16">
          {enableIntro && introContent && !hasSubmitted && (
            <FormIntro align={introAlign} content={introContent} />
          )}
          <div className="mx-auto w-full max-w-lg rounded-md border border-border bg-background p-4 lg:p-6">
            <FormProvider {...formMethods}>
              <FormStatus
                confirmationMessage={form.confirmationMessage}
                confirmationType={form.confirmationType}
                error={error}
                hasSubmitted={hasSubmitted}
                isLoading={isLoading}
              />
              {!hasSubmitted && (
                <form id={formDomID} onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4 last:mb-0">
                    {form.formObject?.fields && (
                      <FormFieldRows
                        control={control}
                        errors={errors}
                        fields={form.formObject.fields as unknown as FormFieldBlock[]}
                        register={register}
                      />
                    )}
                  </div>

                  <Button form={formDomID} type="submit" variant="default" className="w-full">
                    {form.submitButtonLabel}
                  </Button>
                </form>
              )}
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

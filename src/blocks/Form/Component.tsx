'use client'
import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { Form as GeneratedForm, FormBlock as PayloadFormBlock } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { fields } from './fields'
import type { FormErrorState, FormSubmissionResponse } from './types'
import {
  generateFieldKey,
  generateRowKey,
  groupFieldsIntoRows,
  isFieldFullWidth,
  transformFormDataForSubmission,
} from './utils'

export const FormBlock: React.FC<PayloadFormBlock> = (props) => {
  const { enableIntro = false, form: formFromProps, introContent } = props

  const formObject =
    typeof formFromProps === 'object' && formFromProps
      ? (formFromProps as GeneratedForm)
      : undefined

  const formID =
    typeof formFromProps === 'object'
      ? (formFromProps as GeneratedForm).id
      : (formFromProps as number | undefined)
  const confirmationMessage = formObject?.confirmationMessage as DefaultTypedEditorState | undefined
  const confirmationType = formObject?.confirmationType as 'message' | 'redirect' | undefined
  const redirect = formObject?.redirect
  const submitButtonLabel = formObject?.submitButtonLabel

  const formMethods = useForm()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<FormErrorState | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: Record<string, unknown>) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = transformFormDataForSubmission(data)

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = (await req.json()) as FormSubmissionResponse

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
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

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-8 md:px-14 lg:max-w-[40rem] lg:px-16">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="border-border bg-background w-full rounded-md border p-4 lg:p-6">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && confirmationMessage && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form id={formID ? String(formID) : undefined} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {formObject?.fields &&
                  groupFieldsIntoRows(formObject.fields as unknown as FormFieldBlock[]).map(
                    (row, rowIndex) => (
                      <div
                        key={generateRowKey(row, rowIndex)}
                        className="mb-6 grid grid-cols-2 gap-4 last:mb-0"
                      >
                        {row.map((field, fieldIndex) => {
                          const Field = fields?.[field.blockType as keyof typeof fields]
                          if (Field) {
                            const isFullWidth = isFieldFullWidth(field)

                            return (
                              <div
                                key={generateFieldKey(field, rowIndex, fieldIndex)}
                                className={isFullWidth ? 'col-span-2' : 'col-span-1'}
                              >
                                <Field
                                  {...(field as any)}
                                  errors={errors}
                                  register={register}
                                />
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    ),
                  )}
              </div>

              <Button
                form={formID ? String(formID) : undefined}
                type="submit"
                variant="default"
                className="w-full"
              >
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}

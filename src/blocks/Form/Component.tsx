'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

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

          const res = await req.json()

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

  // Function to group fields into rows based on width
  const groupFieldsIntoRows = (fields: FormFieldBlock[]) => {
    const rows: FormFieldBlock[][] = []
    let currentRow: FormFieldBlock[] = []
    let currentRowWidth = 0

    fields.forEach((field) => {
      const fieldWidth = 'width' in field && field.width ? Number(field.width) : 100

      // If adding this field would exceed 100%, start a new row
      if (currentRowWidth + fieldWidth > 100) {
        rows.push([...currentRow])
        currentRow = [field]
        currentRowWidth = fieldWidth
      } else {
        // Add to current row
        currentRow.push(field)
        currentRowWidth += fieldWidth
      }
    })

    // Add the last row if it has any fields
    if (currentRow.length > 0) {
      rows.push(currentRow)
    }

    return rows
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-8 md:px-14 lg:max-w-[40rem] lg:px-16">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="border-border bg-background w-full rounded-md border p-4 lg:p-6">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {formFromProps && formFromProps.fields && (
                  <>
                    {groupFieldsIntoRows(formFromProps.fields).map((row, rowIndex) => (
                      <div
                        key={`row-${rowIndex}`}
                        className="mb-6 grid grid-cols-2 gap-4 last:mb-0"
                      >
                        {row.map((field, fieldIndex) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const Field: React.FC<any> =
                            fields?.[field.blockType as keyof typeof fields]
                          if (Field) {
                            const isFullWidth =
                              !('width' in field) ||
                              !field.width ||
                              field.width === 100 ||
                              field.width > 50

                            return (
                              <div
                                key={`field-${rowIndex}-${fieldIndex}`}
                                className={isFullWidth ? 'col-span-2' : 'col-span-1'}
                              >
                                <Field
                                  form={formFromProps}
                                  {...field}
                                  control={control}
                                  errors={errors}
                                  register={register}
                                />
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Button form={formID} type="submit" variant="default" className="w-full">
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}

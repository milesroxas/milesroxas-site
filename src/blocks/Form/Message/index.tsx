import type { MessageField } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import RichText from '@/components/RichText'
import { Width } from '../Width'

export const Message: React.FC<MessageField> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message as DefaultTypedEditorState} />}
    </Width>
  )
}

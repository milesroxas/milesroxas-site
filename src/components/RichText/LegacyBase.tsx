import type { DefaultTypedEditorState, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'
import { cn } from '@/utilities/ui'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) {
    throw new Error('Expected doc to be defined')
  }
  const { value, relationTo } = doc
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

export const legacyLinkConverters = LinkJSXConverter({ internalDocToHref })

const baseConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...legacyLinkConverters,
})

export type LegacyRichTextProps = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/**
 * The legacy renderer without block converters (`./Legacy.tsx` adds them).
 * Legacy blocks use it for their own rich text, whose editors carry no
 * BlocksFeature, so the blocks and `./Legacy.tsx` do not import each other.
 */
export default function LegacyRichTextBase({
  className,
  converters = baseConverters,
  enableProse = true,
  enableGutter = true,
  ...rest
}: LegacyRichTextProps & Pick<ComponentProps<typeof ConvertRichText>, 'converters'>) {
  return (
    <ConvertRichText
      converters={converters}
      className={cn(
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'prose-custom mx-auto': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}

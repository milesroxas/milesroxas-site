import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  FormBlock as FormBlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import LegacyRichTextBase, { type LegacyRichTextProps, legacyLinkConverters } from './LegacyBase'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | FormBlockProps
    >

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...legacyLinkConverters,
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => {
      const { ...otherFields } = node.fields

      return <MediaBlock aspectRatio={'landscape'} {...otherFields} />
    },
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    formBlock: ({ node }) => <FormBlock {...node.fields} />,
  },
})

/**
 * Rich text for the legacy blocks, heroes and the post body: the renderer
 * this site shipped before the composer port (docs/composer-roadmap.md).
 *
 * Its look comes from the site's own `prose-custom` / `prose-blocks` rules
 * in globals.css. It never carried a working Tailwind Typography `prose`
 * (the plugin was not loaded until the port), so it emits none now that the
 * plugin is on, and it leaves out the `payload-richtext` marker the ported
 * bare rich-text flow keys on. Ported blocks use `./index.tsx`.
 */
export default function LegacyRichText(props: LegacyRichTextProps) {
  return <LegacyRichTextBase converters={jsxConverters} {...props} />
}

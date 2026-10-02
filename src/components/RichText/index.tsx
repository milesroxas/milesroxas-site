import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConverter,
  type JSXConverterArgs,
  type JSXConvertersFunction,
  LinkJSXConverter,
  type SerializedLexicalNodeWithParent,
} from '@payloadcms/richtext-lexical/react'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { RichTextActions } from '@/blocks/rich-text/actions/Component'
import { RichTextInsights } from '@/blocks/rich-text/insights/Component'
import { RichTextPillList } from '@/blocks/rich-text/pill-list/Component'
import { YouTubeBlock } from '@/blocks/youtube/Component'
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  FormBlock as FormBlockProps,
  MediaBlock as MediaBlockProps,
  RichTextActionsBlock as RichTextActionsBlockProps,
  RichTextInsightsBlock as RichTextInsightsBlockProps,
  RichTextPillListBlock as RichTextPillListBlockProps,
  YouTubeBlock as YouTubeBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { isTextStyle, TEXT_STYLE_STATE_KEY, TEXT_STYLES, type TextStyle } from './text-styles'

/*
 * Rich text for the composition blocks, ported from sas-site
 * (`src/components/RichText/index.tsx`). Legacy blocks, heroes and the post
 * body render through `./Legacy.tsx`, which keeps this site's own type rules.
 *
 * Seams against sas-site:
 * - Block converters: this site's (banner, mediaBlock, cta, formBlock) plus
 *   sas-site's composition toolbar blocks (youtube, insights, pillList,
 *   actions) and its code block. No carousel or statement-links converters:
 *   no editor here offers them inline.
 * - Internal links resolve the way this site's routes do; sas-site reads its
 *   content-surface registry, which arrives with Ask (Phase 5).
 */

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | FormBlockProps
      | RichTextActionsBlockProps
      | RichTextInsightsBlockProps
      | RichTextPillListBlockProps
      | YouTubeBlockProps
    >

type ParagraphNode = Extract<DefaultNodeTypes, { type: 'paragraph' }>
type TextNode = Extract<DefaultNodeTypes, { type: 'text' }>

/**
 * The text style the content-column editor stored on a text node
 * (`text-styles.ts`): Lexical node state, under the one key the styles share.
 */
const textStyleOf = (node: SerializedLexicalNodeWithParent | undefined): TextStyle | undefined => {
  const value = (node as { $?: Record<string, unknown> } | undefined)?.$?.[TEXT_STYLE_STATE_KEY]
  return isTextStyle(value) ? value : undefined
}

/**
 * The one style every text child of a paragraph carries, if they all do.
 * Line breaks and blank runs do not count; anything else without the style
 * (a link, unstyled text) means the paragraph is mixed.
 */
const paragraphTextStyle = (node: ParagraphNode): TextStyle | undefined => {
  let style: TextStyle | undefined
  for (const child of node.children) {
    if (child.type === 'linebreak') continue
    if (child.type === 'text' && !(child as TextNode).text.trim()) continue
    const own = child.type === 'text' ? textStyleOf(child) : undefined
    if (!own || (style && own !== style)) return undefined
    style = own
  }
  return style
}

const isParagraph = (node: SerializedLexicalNodeWithParent | undefined): node is ParagraphNode =>
  node?.type === 'paragraph'

const runConverter = <TNode extends SerializedLexicalNodeWithParent>(
  converter: JSXConverter<TNode> | undefined,
  args: JSXConverterArgs<TNode>,
) => (typeof converter === 'function' ? converter(args) : converter)

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) {
    throw new Error('Expected link fields.doc for internal document link')
  }
  const { value, relationTo } = doc
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  /**
   * Text styles (`text-styles.ts`). A paragraph styled throughout carries the
   * style itself, so its line-height and the flow rhythm around it follow
   * the style; a styled run inside a mixed paragraph is a span. Neither is
   * ever both.
   */
  paragraph: ({ node, nodesToJSX }) => {
    const style = paragraphTextStyle(node)
    const children = nodesToJSX({ nodes: node.children })
    return (
      <p className={style ? TEXT_STYLES[style].className : undefined}>
        {children.length ? children : <br />}
      </p>
    )
  },
  text: (args) => {
    const rendered = runConverter(defaultConverters.text, args)
    const style = textStyleOf(args.node)
    if (!style) return rendered
    if (isParagraph(args.parent) && paragraphTextStyle(args.parent) === style) return rendered
    return <span className={TEXT_STYLES[style].className}>{rendered}</span>
  },
  blocks: {
    actions: ({ node }) => <RichTextActions links={node.fields.links} />,
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => <MediaBlock aspectRatio={'landscape'} {...node.fields} />,
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    formBlock: ({ node }) => <FormBlock {...node.fields} />,
    // The Rich text block splits its own blocks out onto its grid before
    // converting (rich-text/Component.tsx); these converters are the inline
    // fallback for any other editor that enables them.
    insights: ({ node }) => (
      <RichTextInsights group={node.fields.id ?? 'insights'} items={node.fields.items} />
    ),
    pillList: ({ node }) => (
      <RichTextPillList eyebrow={node.fields.eyebrow} items={node.fields.items} />
    ),
    youtube: ({ node }) => <YouTubeBlock {...node.fields} enableGutter={false} />,
  },
})

/**
 * Rich text ink variants, owned once here so every block reads the same
 * treatment.
 *
 * - `default`: inherit the surrounding ink.
 * - `emphasis`: body copy renders muted; words the editor bolds are the
 *   emphasis and restore foreground ink. Pair with `enableProse={false}` so
 *   Tailwind Typography's own ink colors don't compete.
 */
const variantClasses = {
  default: '',
  emphasis: 'text-muted-foreground [&_strong]:font-normal [&_strong]:text-foreground',
} as const

type RichTextVariant = keyof typeof variantClasses

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  variant?: RichTextVariant
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, variant = 'default', ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          /* Article scale: bridge Tailwind Typography to the fluid type
             tokens. h1/h2 step down one visual level inside a reading column;
             h3/h4 take medium — at near-body sizes weight, not size, carries
             hierarchy. */
          'mx-auto prose dark:prose-invert': enableProse,
          'prose-h1:text-heading-2 prose-h2:text-heading-3 prose-h3:text-lead prose-h3:leading-snug prose-h3:font-medium prose-h4:font-medium':
            enableProse,
        },
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}

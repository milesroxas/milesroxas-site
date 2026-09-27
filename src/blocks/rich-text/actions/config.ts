import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

/**
 * Actions inside a content column: one or two links set as buttons in a
 * row, dropped between paragraphs from the editor toolbar (Paper: "Button
 * Primary", "Button Text", "Button Pair"). Each link picks its appearance:
 * Default is the primary chip, Text the underlined action beside it, so the
 * pair, a lone chip, and a lone text action are all one block.
 *
 * A Lexical block, so it lives in the body JSON: no table, no migration.
 * Labels reach RAG and llms.txt through the Lexical markdown walker
 * (`lexicalToMarkdown`), which emits any block's `links`.
 */
export const RichTextActions: Block = {
  slug: 'actions',
  interfaceName: 'RichTextActionsBlock',
  labels: { singular: 'Actions', plural: 'Actions' },
  fields: [
    linkGroup({
      // This site's link field has no `text` appearance (composer roadmap D8):
      // Outline stands in for the secondary action.
      appearances: ['default', 'outline'],
      overrides: {
        required: true,
        minRows: 1,
        maxRows: 2,
        admin: {
          initCollapsed: false,
          description:
            'One or two links, set in a row. Default is the primary chip; Outline is the secondary action beside it.',
        },
      },
    }),
  ],
}

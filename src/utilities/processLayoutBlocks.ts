import type { ContentBlock, Page, Work } from '@/payload-types'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'

type LayoutBlock = Page['layout'][number] | Work['layout'][number]

/**
 * Process content block columns, replacing protected works with fallbacks
 * (or removing them when no usable fallback exists)
 */
async function processContentBlock(block: ContentBlock, hasAccess: boolean): Promise<ContentBlock> {
  if (!block.columns?.length) {
    return block
  }

  const processedColumns = await Promise.all(
    block.columns.map(async (column) => {
      if (column.content !== 'work' || !column.work?.works) {
        return column
      }

      const work = column.work.works
      if (typeof work === 'number') {
        // Work is not populated, skip processing
        return column
      }

      const visibleWork = await resolveVisibleWork(work, hasAccess)

      return {
        ...column,
        work: {
          ...column.work,
          works: visibleWork,
        },
      }
    }),
  )

  return {
    ...block,
    columns: processedColumns,
  }
}

/**
 * Process all layout blocks, replacing protected works with their fallbacks
 * when the user doesn't have access.
 *
 * This ensures protected works are hidden everywhere they might appear:
 * - Content block work entries
 * - Any other blocks that might contain work references
 */
export async function processLayoutBlocks(
  blocks: LayoutBlock[],
  hasAccess: boolean,
): Promise<LayoutBlock[]> {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return blocks
  }

  const processedBlocks = await Promise.all(
    blocks.map(async (block) => {
      switch (block.blockType) {
        case 'content':
          return processContentBlock(block as ContentBlock, hasAccess)

        // Archive blocks handle their own access control
        // Other blocks don't contain work references
        default:
          return block
      }
    }),
  )

  return processedBlocks
}

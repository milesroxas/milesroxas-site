import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { ContentBlock, Page, Work } from '@/payload-types'

type LayoutBlock = Page['layout'][number] | Work['layout'][number]

/**
 * Process a single work, replacing protected works with their fallbacks if user doesn't have access
 */
async function processWork(work: Work, hasAccess: boolean): Promise<Work> {
  if (!work.isProtected || hasAccess || !work.fallbackWork) {
    return work
  }

  const payload = await getPayload({ config: configPromise })
  const fallbackId =
    typeof work.fallbackWork === 'number' ? work.fallbackWork : work.fallbackWork.id

  const fallbackWork = await payload.findByID({
    collection: 'works',
    id: fallbackId,
    depth: 2,
  })

  return fallbackWork as Work
}

/**
 * Process content block columns, replacing protected works with fallbacks
 */
async function processContentBlock(
  block: ContentBlock,
  hasAccess: boolean,
): Promise<ContentBlock> {
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

      const processedWork = await processWork(work, hasAccess)

      return {
        ...column,
        work: {
          ...column.work,
          works: processedWork,
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

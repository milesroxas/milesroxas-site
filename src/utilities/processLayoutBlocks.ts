import type { ContentBlock, Page, Post, SliderBlock, Work } from '@/payload-types'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'

type LayoutBlock =
  | Page['layout'][number]
  | Work['layout'][number]
  | NonNullable<Post['layout']>[number]

/** Unlinks a slide whose work the visitor cannot open (unpublished, or protected without a fallback). */
async function processSlides(
  slides: SliderBlock['slides'],
  hasAccess: boolean,
): Promise<SliderBlock['slides']> {
  if (!slides?.length) return slides

  return Promise.all(
    slides.map(async (item) => {
      const link = item.slide.link
      if (link?.relationTo !== 'works' || typeof link.value !== 'object') return item

      const visibleWork = await resolveVisibleWork(link.value, hasAccess)
      return visibleWork ? item : { ...item, slide: { ...item.slide, link: null } }
    }),
  )
}

/**
 * Process content block columns: unpublished works are removed, protected
 * works are replaced with fallbacks (or removed when no usable fallback exists)
 */
async function processContentBlock(block: ContentBlock, hasAccess: boolean): Promise<ContentBlock> {
  if (!block.columns?.length) {
    return block
  }

  const processedColumns = await Promise.all(
    block.columns.map(async (column) => {
      if (column.content === 'slider' && column.slider?.slides) {
        return {
          ...column,
          slider: {
            ...column.slider,
            slides: await processSlides(column.slider.slides, hasAccess),
          },
        }
      }

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
 * when the user doesn't have access, and hiding works that are not published.
 *
 * This ensures those works are hidden everywhere they might appear:
 * - Content block work entries
 * - Slide links, in a Slider block or a Content column
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

        case 'slider':
          return { ...block, slides: await processSlides(block.slides, hasAccess) }

        // A Section nests Columns blocks too: their work entries hide the same way.
        case 'section':
          return {
            ...block,
            blocks: await Promise.all(
              (block.blocks ?? []).map((child) =>
                child.blockType === 'content' ? processContentBlock(child, hasAccess) : child,
              ),
            ),
          }

        // Archive blocks handle their own access control
        // Other blocks don't contain work references
        default:
          return block
      }
    }),
  )

  return processedBlocks
}

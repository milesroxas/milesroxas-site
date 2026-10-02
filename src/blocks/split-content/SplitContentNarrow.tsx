import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import type { Visual as VisualValue } from '@/features/immersive/visual'
import type { SplitContentNarrowBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { CopyStack, VisualCell } from '../shared/cells'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Presentational split on the composition grid: narrow text column beside a
 * large image. Collection-agnostic, the caller resolves `content` from
 * whichever source applies (inline body or canonical story content) and passes
 * it in.
 *
 * Media spans 5 columns at `md` and 6 from `lg`; the text column takes the
 * rest (3, then 2). The `lg` narrowing matches the old fixed 17rem column at
 * the design width; holding 3 columns at `md` keeps the copy readable where a
 * 2-column cell would be too tight. Mirrored when `imagePosition` is right.
 *
 * Stacked below `md` (media always first regardless of `imagePosition`), with
 * heading and body packed to the top. Both cells pin `md:row-start-1`: with
 * the image on the right the media cell precedes the text cell in source order
 * but sits in later columns, and auto-placement would push the text to the
 * next row.
 *
 * The copy column is a `text-stack`, so the eyebrow → heading → body rhythm and
 * the text-box trimming behind it come from the shared utility rather than gaps
 * set here. The eyebrow labels its heading at every breakpoint, in the one
 * kicker treatment the media and split family shares — it used to be rendered
 * twice, in two different styles, to sit below the heading on mobile.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const SplitContentNarrow = ({
  bare = false,
  block,
  content,
  visual,
}: {
  bare?: boolean
  block: Pick<
    SplitContentNarrowBlock,
    'eyebrow' | 'heading' | 'imagePosition' | 'textSize' | 'theme'
  >
  content: DefaultTypedEditorState | null | undefined
  visual: VisualValue
}) => {
  if (!content) return null
  const imageLeft = block.imagePosition === 'left'
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <Container>
        <BlockGrid>
          <VisualCell
            className={cn(
              'relative aspect-5/4 w-full self-start overflow-hidden rounded-lg bg-muted md:aspect-3/2',
              'md:col-span-5 md:row-start-1 lg:col-span-6',
              !imageLeft && 'md:col-start-4 lg:col-start-3',
            )}
            size="(max-width: 768px) 100vw, 72vw"
            visual={visual}
          />
          <div
            className={cn(
              'text-stack md:col-span-3 md:row-start-1 lg:col-span-2',
              imageLeft && 'md:col-start-6 lg:col-start-7',
            )}
          >
            <CopyStack
              content={content}
              eyebrow={block.eyebrow}
              heading={block.heading}
              reveal
              textSize={block.textSize}
            />
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}

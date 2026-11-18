import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import type { Visual as VisualValue } from '@/features/immersive/visual'
import type { SplitContentNarrowBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { CopyStack, VisualCell } from '../shared/cells'
import { BlockGrid } from '../shared/grid'
import { ordinalLabel } from '../shared/numbering'
import { Section } from '../shared/section'
import { typeScale } from '../shared/typography'

type ListItems = SplitContentNarrowBlock['items']

/**
 * The List content: each item under a rule, its ordinal on an ink square
 * beside the title, then the description in muted ink.
 */
const NarrowList = ({
  items,
  textSize,
}: {
  items: NonNullable<ListItems>
  textSize: SplitContentNarrowBlock['textSize']
}) => {
  const type = typeScale(textSize)
  return (
    <ol className="flex flex-col gap-8 pt-1">
      {items.map((item, index) => (
        <li
          className="border-foreground flex flex-col gap-3 border-t pt-4"
          data-reveal
          key={item.id ?? index}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="bg-foreground text-background text-xs/none grid size-7 shrink-0 place-items-center font-mono tabular-nums"
            >
              {ordinalLabel(index)}
            </span>
            <h3 className={type.lead}>{item.title}</h3>
          </div>
          {item.description ? (
            <p
              className={cn(
                'text-muted-foreground',
                textSize === 'large' ? 'text-base' : 'text-sm',
              )}
            >
              {item.description}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

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
 * With `contentType: 'list'` the copy column sets `items` under the heading in
 * place of the body, and the media holds 5:4 from `md` so the taller column
 * has a frame to stand beside.
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
    'contentType' | 'eyebrow' | 'heading' | 'imagePosition' | 'items' | 'textSize' | 'theme'
  >
  content: DefaultTypedEditorState | null | undefined
  visual: VisualValue
}) => {
  const list = block.contentType === 'list' && block.items?.length ? block.items : null
  if (block.contentType === 'list' ? !list : !content) return null
  const imageLeft = block.imagePosition === 'left'
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <Container>
        <BlockGrid>
          <VisualCell
            className={cn(
              'bg-muted relative aspect-5/4 w-full self-start overflow-hidden rounded-lg',
              !list && 'md:aspect-3/2',
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
              content={list ? null : content}
              eyebrow={block.eyebrow}
              heading={block.heading}
              reveal
              textSize={block.textSize}
            />
            {list ? <NarrowList items={list} textSize={block.textSize} /> : null}
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}

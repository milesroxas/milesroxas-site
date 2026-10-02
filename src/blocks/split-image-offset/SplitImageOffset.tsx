import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import type {
  Media as MediaDoc,
  SplitImageOffsetBlock as SplitImageOffsetBlockType,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { MediaCell } from '../shared/cells'
import { Section } from '../shared/section'
import { typeScale } from '../shared/typography'

export const SplitImageOffset = ({
  bare = false,
  block,
  content,
  large,
  small,
}: {
  bare?: boolean
  block: Pick<SplitImageOffsetBlockType, 'captionPosition' | 'heading' | 'textSize' | 'theme'>
  content: DefaultTypedEditorState | null | undefined
  large: MediaDoc
  small: MediaDoc
}) => {
  if (!content) return null
  const captionLeft = block.captionPosition === 'left'
  const type = typeScale(block.textSize)
  // The small 3:2 image and its caption travel as one column beside the 5:4
  // image — top-aligned, with a fixed gap between them at every viewport. At
  // lg the right gutter drops and a trailing 0.25fr spacer column holds the
  // caption side off the page edge instead; below md everything stacks, with
  // the small image and caption at 4/5 width to keep the offset's trailing
  // air.
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <div className="px-gutter lg:pe-0">
        <div
          className={cn(
            'grid grid-cols-1 gap-4 md:gap-8',
            captionLeft
              ? 'md:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,0.25fr)]'
              : 'md:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,0.25fr)]',
          )}
        >
          <MediaCell
            className={cn(
              'relative aspect-5/4 w-full overflow-hidden rounded-lg bg-muted md:row-start-1 md:self-start',
              captionLeft ? 'md:col-start-2' : 'md:col-start-1',
            )}
            resource={large}
            size="(max-width: 768px) 100vw, 60vw"
          />
          <div
            className={cn(
              'flex flex-col gap-4 md:row-start-1 md:gap-8 md:self-start',
              captionLeft ? 'md:col-start-1' : 'md:col-start-2',
            )}
          >
            <MediaCell
              className="relative aspect-3/2 w-4/5 overflow-hidden rounded-lg bg-muted md:w-full"
              resource={small}
              size="(max-width: 768px) 80vw, 30vw"
            />
            <div className="flex w-4/5 max-w-80 flex-col gap-4 md:w-full" data-reveal>
              {block.heading && (
                <h2 className={cn(type.heading, 'pr-8 text-balance md:pr-24')}>{block.heading}</h2>
              )}
              <RichText
                className={type.body}
                data={content}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

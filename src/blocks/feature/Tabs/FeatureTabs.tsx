'use client'

import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import type { RowWithVisual } from '@/blocks/shared/row-visuals'
import { Section } from '@/blocks/shared/section'
import { TabbedPanels } from '@/blocks/shared/tabs'
import { eyebrowClassName, type TypeScale, typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { Visual } from '@/components/Visual'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

/** A tab after the adapter resolved its visual slot; the story `source` never reaches the client. */
type FeatureTab = Omit<RowWithVisual<NonNullable<FeatureTabsBlockData['tabs']>[number]>, 'source'>

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or the work-page reveal band).
 */
type FeatureTabsProps = {
  bare?: boolean
  tabs: FeatureTab[]
  tabSize?: FeatureTabsBlockData['tabSize']
  textSize?: FeatureTabsBlockData['textSize']
  theme?: FeatureTabsBlockData['theme']
}

const MEDIA_SIZES = '(max-width: 1024px) 100vw, 62vw'

/**
 * One tab's panel on the composition grid. From `lg` the copy column (lead
 * statement, body, included list) takes columns 1-3 and the media plate
 * columns 4-8 at 16:9; grid cells stretch to the row, so the copy column's
 * `justify-between` pins the statement to the plate's top edge and the list
 * to its bottom.
 *
 * Below `lg` both stack full width with the plate first, at 3:2: the plate
 * is what a tab changes most, so it sits right under the strip and a tap
 * shows its answer without a scroll. A tab with no picture drops the plate
 * there rather than leave an empty frame between the strip and its copy.
 * The caption is the plate's card from `md`. On a phone a card would cover
 * most of the picture, and a caption between the plate and the heading
 * reads as the panel's intro, so the figure dissolves into the stack
 * (`contents`) and the caption closes the panel as a note.
 *
 * Every part is marked for the swap (`shared/tab-swap.ts`): the plate wipes,
 * its picture settles, the copy cascades.
 */
const TabPanel: React.FC<{ tab: FeatureTab; type: TypeScale }> = ({ tab, type }) => (
  <BlockGrid>
    <div className="flex flex-col justify-between gap-8 md:col-span-8 lg:col-span-3 lg:gap-12">
      <div className="text-stack">
        <h3 className={cn(type.heading, 'text-balance')} data-tab-swap="copy">
          {tab.heading}
        </h3>
        {tab.description ? (
          <div className="text-pretty" data-tab-swap="copy">
            <RichText
              className={type.body}
              data={tab.description}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        ) : null}
      </div>
      {tab.items?.length ? (
        <div className="flex flex-col gap-3">
          {tab.subheading ? (
            <h4 className={cn(eyebrowClassName, 'text-muted-foreground')} data-tab-swap="copy">
              {tab.subheading}
            </h4>
          ) : null}
          <ul className="divide-border flex flex-col divide-y text-sm">
            {tab.items.map((item, itemIndex) => (
              <li key={item.id ?? itemIndex} className="py-1.5 last:pb-0" data-tab-swap="copy">
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    <figure
      className={cn(
        'relative max-lg:order-first max-md:contents md:col-span-8 lg:col-span-5',
        !tab.visual && 'max-lg:hidden',
      )}
    >
      <div
        className={cn(
          'relative aspect-3/2 overflow-hidden rounded-lg max-md:order-first lg:aspect-16/9',
          !tab.visual && 'max-lg:hidden',
        )}
        data-tab-swap="plate"
      >
        {tab.visual ? (
          <div className="absolute inset-0" data-tab-swap="settle">
            <Visual
              fill
              htmlElement={null}
              imgClassName="object-cover"
              placement="block"
              size={MEDIA_SIZES}
              visual={tab.visual}
            />
          </div>
        ) : null}
      </div>
      {tab.caption ? (
        <figcaption
          className="text-muted-foreground md:bg-card text-sm max-md:order-last md:absolute md:right-8 md:bottom-9 md:max-w-72 md:rounded-md md:p-4"
          data-tab-swap="copy"
        >
          {tab.caption}
        </figcaption>
      ) : null}
    </figure>
  </BlockGrid>
)

/**
 * The tabs block: the shared tabbed shell (`shared/tabs.tsx`) with this
 * block's panel inside it. `bare` skips the band for a caller whose shell
 * already painted one.
 */
export const FeatureTabs: React.FC<FeatureTabsProps> = ({
  bare,
  tabs,
  tabSize,
  textSize,
  theme,
}) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  const type = typeScale(textSize)

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <TabbedPanels
          ariaLabel="Feature tabs"
          renderPanel={(tab) => <TabPanel tab={tab} type={type} />}
          rows={panels}
          tabSize={tabSize}
        />
      </Container>
    </Section>
  )
}

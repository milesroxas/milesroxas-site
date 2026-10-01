'use client'

import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import type { RowWithVisual } from '@/blocks/shared/row-visuals'
import { Section } from '@/blocks/shared/section'
import { TabbedPanels } from '@/blocks/shared/tabs'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { Visual } from '@/components/Visual'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'

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
  theme?: FeatureTabsBlockData['theme']
}

const MEDIA_SIZES = '(max-width: 1024px) 100vw, 62vw'

/**
 * One tab's panel on the composition grid. From `lg` the copy column (lead
 * statement, body, included list) takes columns 1-3 and the media plate
 * columns 4-8 at 16:9; grid cells stretch to the row, so the copy column's
 * `justify-between` pins the statement to the plate's top edge and the list
 * to its bottom. At `md` both cells span the full eight columns and stack on
 * the grid's gap, the plate at 3:2: three columns of a 768px page cannot hold
 * a heading, and a 16:9 plate there is shallower than its caption card.
 */
const TabPanel: React.FC<{ tab: FeatureTab }> = ({ tab }) => (
  <BlockGrid>
    <div className="flex flex-col justify-between gap-12 md:col-span-8 lg:col-span-3">
      <div className="text-stack">
        <h3 className="text-heading-3">{tab.heading}</h3>
        {tab.description ? (
          <RichText
            className="text-sm md:text-base"
            data={tab.description}
            enableGutter={false}
            enableProse={false}
          />
        ) : null}
      </div>
      {tab.items?.length ? (
        <div className="flex flex-col gap-3">
          {tab.subheading ? (
            <h4 className="font-mono text-sm font-normal text-muted-foreground">
              {tab.subheading}
            </h4>
          ) : null}
          <ul className="flex flex-col divide-y divide-border text-sm">
            {tab.items.map((item, itemIndex) => (
              <li key={item.id ?? itemIndex} className="py-1 last:pb-0">
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    <div className="relative aspect-3/2 overflow-hidden md:col-span-8 lg:col-span-5 lg:aspect-16/9">
      {tab.visual ? (
        <Visual
          fill
          htmlElement={null}
          imgClassName="object-cover"
          placement="block"
          size={MEDIA_SIZES}
          visual={tab.visual}
        />
      ) : null}
      {tab.caption ? (
        <div className="absolute right-4 bottom-4 max-w-72 rounded-md bg-card p-4 text-card-foreground md:right-8 md:bottom-9">
          <p className="text-sm text-muted-foreground">{tab.caption}</p>
        </div>
      ) : null}
    </div>
  </BlockGrid>
)

/**
 * The tabs block: the shared tabbed shell (`shared/tabs.tsx`) with this
 * block's panel inside it. `bare` skips the band for a caller whose shell
 * already painted one.
 */
export const FeatureTabs: React.FC<FeatureTabsProps> = ({ bare, tabs, tabSize, theme }) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <TabbedPanels
          ariaLabel="Feature tabs"
          renderPanel={(tab) => <TabPanel tab={tab} />}
          rows={panels}
          tabSize={tabSize}
        />
      </Container>
    </Section>
  )
}

'use client'

import { SliderBlock } from '@/blocks/Slider/Component'
import { sectionThemeClass } from '@/blocks/shared/band-theme'
import RichText from '@/components/RichText/Legacy'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/legacy-tabs'
import { type SpaceProps, useSpacing } from '@/hooks/useSpacing'
import type { TabsBlock as TabsBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

type TabsBlockLocalProps = TabsBlockProps & {
  className?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabsContentClassName?: string
}

type Tab = NonNullable<TabsBlockProps['tabs']>[number]

const TabsHeading = ({ heading }: { heading: NonNullable<TabsBlockProps['heading']> }) => (
  <div className="mb-12">
    {heading.eyebrow && (
      <p className={'mb-4 font-mono text-muted-foreground text-sm/tight'}>{heading.eyebrow}</p>
    )}
    <h3
      className={cn(
        'mb-4 text-4xl/relaxed leading-tight',
        heading.style === 'center' && 'text-center',
      )}
    >
      {heading.heading}
    </h3>
    {heading.subheading && <p className={'text-lg'}>{heading.subheading}</p>}
  </div>
)

const TabPanel = ({ tab, theme }: { tab: Tab; theme: TabsBlockProps['theme'] }) => (
  <>
    {tab.contentType === 'richText' && tab.richText && (
      <RichText data={tab.richText} enableGutter={false} className="prose-blocks text-base" />
    )}
    {tab.contentType === 'slider' && tab.slider && (
      <div className="w-full overflow-hidden rounded-md">
        <SliderBlock
          {...tab.slider}
          blockType="slider"
          theme={theme}
          slides={tab.slider.slides}
          id={tab.id}
        />
      </div>
    )}
  </>
)

export const TabsBlock: React.FC<TabsBlockLocalProps> = (props) => {
  const { tabs, space, heading, theme } = props

  const spacingStyles = useSpacing(space as SpaceProps)

  return (
    <div className={cn(sectionThemeClass(theme), 'w-full')}>
      <div style={spacingStyles}>
        <div className="container px-8 md:px-14 lg:px-16">
          <Tabs
            defaultValue={tabs?.[0]?.id != null ? String(tabs[0].id) : undefined}
            className="flex flex-col items-start gap-8 md:flex-row"
          >
            <div className="basis-full md:basis-4/12">
              {heading && <TabsHeading heading={heading} />}
              <TabsList className="w-full">
                {tabs?.map((tab) => (
                  <TabsTrigger key={tab.id} value={String(tab.id)}>
                    <span className="text-sm">{tab.tabTitle}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="basis-full gap-6 overflow-hidden rounded-md md:basis-8/12">
              {tabs?.map((tab) => (
                <TabsContent key={tab.id} value={String(tab.id)}>
                  <TabPanel tab={tab} theme={theme} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

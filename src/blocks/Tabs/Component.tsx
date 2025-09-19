'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { SliderBlock } from '@/blocks/Slider/Component'
import { useBlockTheme } from '@/hooks/useBlockTheme'
import { useSpacing, SpaceProps } from '@/hooks/useSpacing'
import type { TabsBlock as TabsBlockProps } from '@/payload-types'

type TabsBlockLocalProps = TabsBlockProps & {
  className?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabsContentClassName?: string
}

export const TabsBlock: React.FC<TabsBlockLocalProps> = (props) => {
  const { tabs, space, heading, theme = 'system' } = props

  const appliedTheme = useBlockTheme(theme)

  const spacingStyles = useSpacing(space as SpaceProps)

  return (
    <div data-theme={appliedTheme} className={cn('w-full', {})}>
      <div style={spacingStyles} className="bg-background text-foreground">
        <div className="container px-8 md:px-14 lg:px-16">
          <Tabs
            defaultValue={tabs?.[0]?.id != null ? String(tabs[0].id) : undefined}
            className="flex flex-col items-start gap-8 md:flex-row"
          >
            <div className="basis-full md:basis-4/12">
              {heading && (
                <div className="mb-12">
                  {heading?.eyebrow && (
                    <p className={'text-muted-foreground mb-4 font-mono text-sm/tight'}>
                      {heading?.eyebrow}
                    </p>
                  )}
                  <h3
                    className={cn(
                      'mb-4 text-4xl/relaxed leading-tight',
                      heading?.style === 'center' && 'text-center',
                    )}
                  >
                    {heading?.heading}
                  </h3>
                  {heading?.subheading && <p className={'text-lg'}>{heading?.subheading}</p>}
                </div>
              )}
              <TabsList className="w-full">
                {tabs &&
                  tabs.length > 0 &&
                  tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={String(tab.id)}>
                      <span className="text-sm">{tab.tabTitle}</span>
                    </TabsTrigger>
                  ))}
              </TabsList>
            </div>

            <div className="basis-full gap-6 overflow-hidden rounded-md md:basis-8/12">
              {tabs &&
                tabs.length > 0 &&
                tabs.map((tab) => (
                  <TabsContent key={tab.id} value={String(tab.id)}>
                    {tab.contentType === 'richText' && tab.richText && (
                      <RichText
                        data={tab.richText}
                        enableGutter={false}
                        className="prose-blocks text-base"
                      />
                    )}
                    {tab.contentType === 'slider' && tab.slider && (
                      <div className="w-full overflow-hidden rounded-md">
                        <SliderBlock
                          {...tab.slider}
                          blockType="slider"
                          theme="dark"
                          slides={tab.slider.slides}
                          id={tab.id}
                        />
                      </div>
                    )}
                  </TabsContent>
                ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { SliderBlock, type SliderBlockProps as SliderDataProps } from '@/blocks/Slider/Component'
import { useTheme } from '@/providers/Theme'
import { useEffect, useState } from 'react'

type Tab = {
  id: string
  tabTitle?: string
  className?: string
  contentType: 'richText' | 'slider'
  richText?: any
  slider?: Omit<SliderDataProps, 'introContent' | 'space' | 'blockType' | 'className'>
}

type TabsBlockProps = {
  tabs: Tab[]
  space?: {
    pt?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    pb?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    mt?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    mb?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }
  theme?: 'light' | 'dark' | 'system'

  className?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabsContentClassName?: string
  id: number
  heading?: {
    style: 'default' | 'center'
    eyebrow?: string
    heading?: string
    subheading?: string
  }
}

export const TabsBlock: React.FC<TabsBlockProps> = (props) => {
  const { tabs, space, className, id, heading, theme = 'system' } = props
  const getSpacingClasses = (space?: TabsBlockProps['space']) => {
    if (!space) return {}

    return {
      'pt-0': space.pt === 'none',
      'pt-12': space.pt === 'sm',
      'pt-16': space.pt === 'md',
      'pt-32': space.pt === 'lg',
      'pt-64': space.pt === 'xl',

      'pb-0': space.pb === 'none',
      'pb-12': space.pb === 'sm',
      'pb-16': space.pb === 'md',
      'pb-32': space.pb === 'lg',
      'pb-64': space.pb === 'xl',

      'mt-0': space.mt === 'none',
      'mt-12': space.mt === 'sm',
      'mt-16': space.mt === 'md',
      'mt-32': space.mt === 'lg',
      'mt-64': space.mt === 'xl',

      'mb-0': space.mb === 'none',
      'mb-12': space.mb === 'sm',
      'mb-16': space.mb === 'md',
      'mb-32': space.mb === 'lg',
      'mb-64': space.mb === 'xl',
    }
  }
  const [currentIndex, setCurrentIndex] = useState(0)
  const { theme: systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme =
    theme === 'dark'
      ? 'dark'
      : mounted && (theme === 'system' || !theme)
        ? systemTheme
        : theme || 'light'

  return (
    <div
      className={cn(
        className,
        {
          'bg-primary text-primary-foreground font-light': activeTheme === 'dark',
          'bg-background text-foreground': activeTheme === 'light',
        },
        getSpacingClasses(space),
      )}
      id={`block-${id}`}
      data-theme={activeTheme}
    >
      <div className="container px-8 md:px-14 lg:px-16">
        <Tabs defaultValue={tabs[0]?.id} className="flex flex-col items-start gap-8 md:flex-row">
          <div className="basis-full md:basis-4/12">
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
            <TabsList className="w-full">
              {tabs &&
                tabs.length > 0 &&
                tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <span className="text-sm">{tab.tabTitle}</span>
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>

          <div className="basis-full gap-6 md:basis-8/12">
            {tabs &&
              tabs.length > 0 &&
              tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.contentType === 'richText' && tab.richText && (
                    <RichText
                      data={tab.richText}
                      enableGutter={false}
                      className="prose-blocks text-base"
                    />
                  )}
                  {tab.contentType === 'slider' && tab.slider && (
                    <div className="w-full">
                      <SliderBlock {...tab.slider} blockType="slider" theme="dark" />
                    </div>
                  )}
                </TabsContent>
              ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

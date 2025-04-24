import { cn } from '@/utilities/ui'
import React from 'react'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { ContentBlockClient } from './Component.client'

import { CMSLink } from '../../components/Link'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'
import { WorkCard } from '@/components/Card/Works/Component'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, theme, space } = props

  // Calculate theme and spacing on the server
  const sectionTheme = theme || 'light'

  const getSpacingClasses = (space?: ContentBlockProps['space']) => {
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

  const spacingClasses = getSpacingClasses(space)

  return (
    <div
      className={cn(spacingClasses, {
        'text-foreground': sectionTheme === 'light',
        'bg-primary text-primary-foreground font-light': sectionTheme === 'dark',
      })}
    >
      <div className="container">
        <div className="grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
          {/* Render the client component, passing down columns and theme */}
          <ContentBlockClient columns={columns} sectionTheme={sectionTheme} />
        </div>
      </div>
    </div>
  )
}

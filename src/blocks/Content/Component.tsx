'use client'

import type React from 'react'
import { sectionThemeClass } from '@/blocks/shared/band-theme'
import { useSpacing } from '@/hooks/useSpacing'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { ColumnRenderer } from './ColumnRenderer'
import { getColumnClasses } from './utils'

export const ContentBlock: React.FC<ContentBlockProps> = ({
  columns,
  theme: themeOption,
  space,
  containerWidth,
}) => {
  const isFullWidth = containerWidth === 'fullWidth'
  const spacingStyles = useSpacing(space)

  return (
    <div className={cn(sectionThemeClass(themeOption), 'font-light')}>
      <div style={spacingStyles} className="font-light">
        <div
          className={cn(
            'grid grid-cols-4 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-12',
            isFullWidth ? 'w-full' : 'container',
          )}
        >
          {columns?.map((col, idx) => {
            if (!col) return null
            const { sizes, id } = col
            const colClass = getColumnClasses(sizes)

            return (
              <div className={colClass} key={id || `col-${idx}`}>
                <ColumnRenderer
                  column={col}
                  theme={themeOption}
                  isFullWidth={isFullWidth}
                  sizes={sizes}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

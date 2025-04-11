import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { ArchiveBlock } from '../ArchiveBlock/Component'
import { MediaBlock } from '../MediaBlock/Component'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { size, contentType } = col
            // Use a type assertion to tell TypeScript the column has these fields
            const column = col as any

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {contentType === 'text' && column.text?.richText && (
                  <RichText data={column.text.richText} enableGutter={false} />
                )}
                {contentType === 'archive' && column.archive?.archive && (
                  <ArchiveBlock
                    blockType="archive"
                    populateBy="selection"
                    selectedDocs={column.archive.archive.map((item: any) => ({
                      relationTo: 'posts',
                      value: item,
                    }))}
                  />
                )}
                {contentType === 'media' && column.media?.media && (
                  <MediaBlock blockType="mediaBlock" media={column.media.media} />
                )}
                {contentType === 'text' && column.text?.enableLink && column.text?.link && (
                  <CMSLink {...column.text.link} />
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

'use client'

import { sectionThemeClass } from '@/blocks/shared/band-theme'
import type { CardPostData } from '@/components/Card/Posts/Component'
import type { CardWorkData } from '@/components/Card/Works/Component'
import { CollectionArchive } from '@/components/CollectionArchive'
import RichText from '@/components/RichText/Legacy'
import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
export default function ArchiveBlockClient({
  theme,
  introContent,
  posts,
  works,
  cardStyle,
}: {
  theme: ArchiveBlockProps['theme']
  introContent?: ArchiveBlockProps['introContent']
  posts?: CardPostData[]
  works?: CardWorkData[]
  cardStyle?: 'card' | 'featured'
}) {
  return (
    <div
      className={cn(
        sectionThemeClass(theme),
        'pt-32 pb-36',
        cardStyle === 'featured' && 'bg-red-500',
      )}
    >
      {introContent && (
        <div className="container mb-16 px-8 md:px-20">
          <RichText
            className="ms-0 max-w-3xl text-muted-foreground"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive posts={posts} works={works} />
    </div>
  )
}

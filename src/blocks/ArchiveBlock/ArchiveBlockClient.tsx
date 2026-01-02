'use client'

import type { CardPostData } from '@/components/Card/Posts/Component'
import type { CardWorkData } from '@/components/Card/Works/Component'
import { CollectionArchive } from '@/components/CollectionArchive'
import RichText from '@/components/RichText'
import { useBlockTheme } from '@/hooks/useBlockTheme'
import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
export default function ArchiveBlockClient({
  theme,
  introContent,
  posts,
  works,
  cardStyle,
}: {
  theme: 'light' | 'dark' | 'system' | undefined | null
  introContent?: ArchiveBlockProps['introContent']
  posts?: CardPostData[]
  works?: CardWorkData[]
  cardStyle?: 'card' | 'featured'
}) {
  const appliedTheme = useBlockTheme(theme)
  return (
    <div
      data-theme={appliedTheme}
      className={cn(
        'bg-background text-foreground pt-32 pb-36',
        cardStyle === 'featured' && 'bg-red-500',
      )}
    >
      {introContent && (
        <div className="container mb-16 px-8 md:px-20">
          <RichText
            className="text-muted-foreground ms-0 max-w-[48rem]"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive posts={posts} works={works} />
    </div>
  )
}

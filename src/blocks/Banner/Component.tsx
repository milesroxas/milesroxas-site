import type React from 'react'
import RichText from '@/components/RichText/LegacyBase'
import type { BannerBlock as BannerBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <div className={cn('mx-auto my-8 w-full px-8 md:px-14 lg:px-16', className)}>
      <div
        className={cn('flex items-center rounded border px-6 py-3', {
          'border-border bg-card text-card-foreground': style === 'info',
          'border-error bg-error/30': style === 'error',
          'border-success bg-success/30': style === 'success',
          'border-warning bg-warning/30': style === 'warning',
        })}
      >
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </div>
  )
}

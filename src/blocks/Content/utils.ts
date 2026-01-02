import type { ContentBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

export type ColumnSize = NonNullable<NonNullable<ContentBlock['columns']>[number]>['sizes']

/**
 * Generates Tailwind class names for column sizing based on the 'sizes' prop
 */
export function getColumnClasses(sizes: ColumnSize): string {
  return cn('col-span-4', {
    'lg:col-span-4': sizes === 'oneThird',
    'lg:col-span-6': sizes === 'half',
    'lg:col-span-8': sizes === 'twoThirds',
    'lg:col-span-12': sizes === 'full',
    'lg:col-span-5': sizes === 'fiveCols',
    'md:col-span-4': sizes !== 'full' && sizes !== 'twoThirds',
  })
}

/**
 * Generates class names for text size
 */
export function getTextSizeClasses(textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | null): string {
  return cn({
    'text-size-sm': textSize === 'sm',
    'text-size-base': textSize === 'base' || !textSize,
    'text-size-lg': textSize === 'lg',
    'text-size-xl': textSize === 'xl',
    'text-size-2xl': textSize === '2xl',
  })
}

/**
 * Generates class names for section heading alignment
 */
export function getSectionHeadingAlignClasses(align?: 'left' | 'center' | null): string {
  return cn({
    'text-left': align === 'left',
    'text-center': align === 'center',
  })
}

/**
 * Generates class names for section heading size
 */
export function getSectionHeadingSizeClasses(
  size?: 'base' | 'lg' | 'xl' | null,
  align?: 'left' | 'center' | null,
): string {
  return cn({
    'section-heading-base': size === 'base' || !size,
    'section-heading-lg': size === 'lg',
    'section-heading-xl': size === 'xl',
    'max-w-3xl text-center': size === 'xl' && align === 'center',
  })
}

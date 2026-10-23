import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Two textarea treatments, matching `inputVariants`.
 *
 * - `default`: the boxed control.
 * - `bare`: no chrome of its own — for a textarea that sits inside
 *   `FieldPanel`, which owns the border, fill, and radius so the panel's
 *   footer (counter, helper line) shares one frame with the writing area.
 *
 * `text-base` below md in both: sub-16px controls trigger iOS Safari's focus
 * zoom (see `Input`).
 */
const textareaVariants = cva(
  'placeholder:text-muted-foreground flex field-sizing-content w-full resize-none transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-input/20 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 min-h-16 rounded-md border px-2 py-2 text-base focus-visible:ring-2 aria-invalid:ring-2 md:text-xs/relaxed',
        bare: 'min-h-44 border-0 bg-transparent p-5 text-base focus-visible:ring-0 md:text-lg/relaxed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant ?? 'default'}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }

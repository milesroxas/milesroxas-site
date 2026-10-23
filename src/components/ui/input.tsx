import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Three input treatments, stated once.
 *
 * - `default`: the boxed admin/utility control (filters, inline forms).
 * - `line`: the site's editorial form control — no box, a single hairline
 *   under a mono label. Its three states are pure CSS so no call site has to
 *   track them: empty rests on `--input`, a filled value darkens the rule to
 *   `--foreground`, and focus takes it to `--primary` (the label follows via
 *   `FieldLabel variant="mono"`, which reads the field's focus with `has`).
 * - `bare`: no chrome of its own, for an input whose container draws the
 *   field, its focus and its invalid state (a row of an `inset` FieldGroup),
 *   like Textarea's `bare`.
 * - `value`: the boxed control at inspector density, for the number beside a
 *   slider: mono, right-set, tabular so a changing figure never shifts its
 *   neighbours, and no spinner (the slider is the coarse control).
 *
 * `text-base` below md in both: iOS Safari zooms the page when a focused
 * control is under 16px, and the zoom outlives the form.
 */
const inputVariants = cva(
  'placeholder:text-muted-foreground w-full min-w-0 transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-input/20 file:text-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 rounded-md border px-2 py-0.5 text-base file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium focus-visible:ring-2 aria-invalid:ring-2 md:text-xs/relaxed',
        line: 'border-input not-placeholder-shown:border-b-foreground focus-visible:border-b-primary aria-invalid:border-b-destructive h-auto rounded-none border-0 border-b bg-transparent px-0 pb-3 text-base md:text-lg/relaxed',
        bare: 'h-auto rounded-none border-0 bg-transparent p-0 text-base/5 md:text-sm/5',
        value:
          'border-input bg-input/20 disabled:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-6.5 [appearance:textfield] rounded-md border px-2 text-right font-mono text-xs/4 tabular-nums focus-visible:ring-2 disabled:border-transparent disabled:bg-transparent disabled:opacity-100 aria-invalid:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant ?? 'default'}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }

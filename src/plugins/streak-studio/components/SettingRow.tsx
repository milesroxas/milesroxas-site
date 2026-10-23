'use client'

import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/**
 * A setting on the Inspector's own grid: the same label, control and value
 * columns the parameter rows use, so a still's output setting and a parameter
 * read as one panel rather than two forms that happen to share a sidebar. The
 * caller places what follows the label: a control in the middle column,
 * optionally a readout in the value column, or one element spanning both.
 */
export function SettingRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[var(--row-label)_minmax(0,1fr)_var(--row-value)] items-center gap-x-2.5">
      <Label htmlFor={htmlFor} className="text-foreground/80 min-h-9 cursor-default text-xs/4">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function SettingToggle({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly (readonly [value: string, label: string])[]
  onChange: (next: string) => void
}) {
  return (
    <SettingRow label={label}>
      <ToggleGroup
        type="single"
        variant="segmented"
        size="sm"
        aria-label={label}
        value={value}
        onValueChange={(next) => next && onChange(next)}
      >
        {options.map(([option, text]) => (
          <ToggleGroupItem key={option} value={option}>
            {text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </SettingRow>
  )
}

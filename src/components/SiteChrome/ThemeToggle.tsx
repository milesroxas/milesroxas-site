'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'
import { useSiteTheme } from '@/hooks/use-site-theme'
import { useTheme } from '@/providers/Theme'

/**
 * Light or dark, in the top bar beside the clock. Ink only, no glass: the bar
 * has no fill of its own and the toggle is its quiet register, not a control
 * surface.
 *
 * The state comes from `useSiteTheme` (the `<html data-theme>` attribute)
 * rather than the provider's context, so the mark is right on the first
 * client render instead of after a mount effect, and the button still reads
 * correctly anywhere the provider is absent. `setTheme` stores the choice.
 *
 * The icon is the destination, not the current state: a moon offers dark. The
 * swap is a 150ms crossfade with no travel, because the palette behind it
 * changes at the same moment and two moving things read as one glitch.
 *
 * On a phone the button is a 44px touch target (the full bar height) around
 * the same 16px glyph; negative margins keep the glyph on the bar's edge.
 */
export function ThemeToggle() {
  const theme = useSiteTheme()
  const { setTheme } = useTheme()
  const dark = theme === 'dark'
  const Glyph = dark ? IconSun : IconMoon

  return (
    <button
      aria-label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      className="chrome-focus theme-toggle pointer-events-auto -m-3.5 rounded-md p-3.5 text-(--chrome-ink) md:-m-2 md:p-2"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      type="button"
    >
      <Glyph aria-hidden className="size-4" key={theme} />
    </button>
  )
}

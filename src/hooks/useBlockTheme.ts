// src/hooks/useBlockTheme.ts
'use client'

export type ThemeOption = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Accepts a ThemeOption or null/undefined.
 * Returns a resolved theme for block-level theming.
 * For server components, always defaults to 'light' when system is selected.
 */
export function useBlockTheme(themeOption?: ThemeOption | null): ResolvedTheme {
  // fall back to "light" if someone passed null, undefined, or system
  return themeOption === 'dark' ? 'dark' : 'light'
}

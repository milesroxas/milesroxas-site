import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

/**
 * Gets the user's implicit color scheme preference from browser
 * @returns Theme preference or null if none detected
 */
export const getImplicitPreference = (): Theme | null => {
  if (typeof window === 'undefined') return null

  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}

/**
 * Adds proper theme transition when switching themes
 * @param callback Function to run after transition
 */
export const withThemeTransition = (callback: () => void): void => {
  document.documentElement.classList.add('theme-transition')

  // Execute the callback immediately but handle the transition
  callback()

  // Remove the transition class after the transition is complete
  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
}

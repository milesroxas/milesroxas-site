'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import {
  defaultTheme,
  getImplicitPreference,
  themeLocalStorageKey,
  withThemeTransition,
} from './shared'
import { themeIsValid } from './types'

// Re-export core types and utilities for convenience
export type { Theme, ThemeContextType } from './types'
export { themeLocalStorageKey, defaultTheme, withThemeTransition } from './shared'

// Re-export theme selector component
export { ThemeSelector } from './ThemeSelector'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )

  const [mounted, setMounted] = useState(false)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      // Use transition for system preference change
      withThemeTransition(() => {
        window.localStorage.removeItem(themeLocalStorageKey)
        const implicitPreference = getImplicitPreference()
        document.documentElement.setAttribute('data-theme', implicitPreference || '')
        if (implicitPreference) setThemeState(implicitPreference)
      })
    } else {
      // Use transition for explicit theme change
      withThemeTransition(() => {
        setThemeState(themeToSet)
        window.localStorage.setItem(themeLocalStorageKey, themeToSet)
        document.documentElement.setAttribute('data-theme', themeToSet)
      })
    }
  }, [])

  useEffect(() => {
    if (!canUseDOM) return

    let themeToSet: Theme = defaultTheme
    const preference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      const implicitPreference = getImplicitPreference()

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
    setMounted(true)

    // Add listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // Only apply system preference if user hasn't set a preference
      if (!window.localStorage.getItem(themeLocalStorageKey)) {
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        withThemeTransition(() => {
          document.documentElement.setAttribute('data-theme', newTheme)
          setThemeState(newTheme)
        })
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Prevent flash of incorrect theme during hydration
  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)

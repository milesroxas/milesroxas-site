'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useEffect, useState } from 'react'

import type { Theme } from '../types'

import { useTheme } from '..'
import { themeLocalStorageKey } from '../shared'

export const ThemeSelector: React.FC = () => {
  const { setTheme, theme } = useTheme()
  const [value, setValue] = useState<string>('')

  // Handle theme change
  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet as Theme)
      setValue(themeToSet)
    }
  }

  // Initialize value based on localStorage or current theme
  useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? theme ?? 'auto')
  }, [theme])

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label="Select a theme"
        className="theme-transition w-auto gap-2 border-none bg-transparent pl-0 md:pl-3"
      >
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent className="theme-transition">
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  )
}

'use client'

import React from 'react'
import { useTheme } from '..'
import { cn } from '@/utilities/ui'

/**
 * Example component showing usage of the theme provider
 */
export const ThemeExample: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-transition border-border rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-bold">Theme Provider Example</h2>

      <div className="mb-4">
        <p className="text-muted-foreground">
          Current theme: <strong className="text-foreground">{theme || 'system'}</strong>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button active={theme === 'light'} onClick={() => setTheme('light')}>
          Light
        </Button>

        <Button active={theme === 'dark'} onClick={() => setTheme('dark')}>
          Dark
        </Button>

        <Button active={theme === null || theme === undefined} onClick={() => setTheme(null)}>
          System
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <ColorSwatch name="Primary" color="bg-primary text-primary-foreground" />
        <ColorSwatch name="Secondary" color="bg-secondary text-secondary-foreground" />
        <ColorSwatch name="Accent" color="bg-accent text-accent-foreground" />
        <ColorSwatch name="Muted" color="bg-muted text-muted-foreground" />
      </div>
    </div>
  )
}

// Helper Button component
const Button: React.FC<{
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}> = ({ children, onClick, active = false }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'theme-transition rounded px-4 py-2 font-medium',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      )}
    >
      {children}
    </button>
  )
}

// Color swatch component to demonstrate theme colors
const ColorSwatch: React.FC<{
  name: string
  color: string
}> = ({ name, color }) => {
  return (
    <div className="flex flex-col">
      <div className={cn('theme-transition h-10 rounded-md', color)} />
      <span className="mt-1 text-sm">{name}</span>
    </div>
  )
}

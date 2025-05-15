# Theme Provider

A lightweight, flexible theme provider for managing light/dark mode preferences with smooth transitions.

## Features

- 🌓 Automatic system preference detection
- 🔄 Theme persistence using localStorage
- ⚡ Smooth CSS transitions between themes
- 🛡️ Flash-free SSR/hydration handling
- 📱 Real-time system preference change detection

## Usage

### Basic Usage

```tsx
// In your app layout or entry point
import { ThemeProvider } from '@/providers/Theme'

export default function Layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

### Theme Selector Component

Add the theme selector component to let users choose their theme preference:

```tsx
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

export function Navbar() {
  return (
    <nav>
      <ThemeSelector />
    </nav>
  )
}
```

### Using the Hook

Access the current theme and theme-setting function anywhere in your app:

```tsx
'use client'

import { useTheme } from '@/providers/Theme'

export function ThemeAwareComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
      <button onClick={() => setTheme('light')}>Switch to Light</button>
      <button onClick={() => setTheme(null)}>Use System Preference</button>
    </div>
  )
}
```

## Implementation Details

### Architecture

The theme provider uses a React context to manage theme state and provide it to all components:

- **ThemeProvider**: The main context provider that initializes and manages theme state
- **useTheme**: A hook for consuming the theme context
- **ThemeSelector**: A pre-built UI component for selecting themes
- **withThemeTransition**: A utility for smooth theme transitions

### Files Structure

- `index.tsx` - Main provider implementation
- `types.ts` - TypeScript type definitions
- `shared.ts` - Shared utilities and constants
- `ThemeSelector/index.tsx` - Theme selector component

### CSS Integration

The theme system works with Tailwind v4 using:

1. CSS variables for theming
2. Custom `theme-transition` utility class for smooth transitions
3. HTML `data-theme` attribute for theme scoping

## Tailwind Integration

This theme provider is optimized for Tailwind v4, using the new `@utility` directive:

```css
@utility theme-transition {
  transition:
    background-color 0.3s ease-out,
    color 0.3s ease-out,
    border-color 0.3s ease-out,
    box-shadow 0.3s ease-out;
}
```

## Adding New Themes

Currently, the provider supports `light` and `dark` themes. To add more themes:

1. Update the `Theme` type in `types.ts`
2. Add CSS variables for the new theme in your global CSS
3. Update `themeIsValid` function to validate the new theme

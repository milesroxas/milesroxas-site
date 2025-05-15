# Theme Provider Technical Implementation

This document provides technical details about the theme provider implementation.

## Key Architecture Decisions

### 1. State Management

The theme state is managed using React's Context API with several key considerations:

- **useState + useCallback Pattern**: Uses separate state updater function and theme state to avoid unnecessary re-renders.
- **Mounted State**: Uses a separate `mounted` state to prevent flash of incorrect theme during hydration.
- **SSR Compatibility**: Checks for `canUseDOM` before accessing browser APIs to support server-side rendering.

### 2. Theme Transition System

The theme transitions are managed through a combination of:

- **CSS Classes**: A temporary `theme-transition` class is added during theme changes.
- **Callback Pattern**: The `withThemeTransition` utility executes a callback and handles timing.
- **Tailwind v4 Utility**: The theme-transition is defined as a Tailwind v4 utility for consistent usage.

## Core Functions

### Theme Initialization

```typescript
useEffect(() => {
  if (!canUseDOM) return

  // Priority order: localStorage > system preference > default
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

  // System preference listener...
}, [])
```

### Theme Setter

```typescript
const setTheme = useCallback((themeToSet: Theme | null) => {
  if (themeToSet === null) {
    // Use system preference
    withThemeTransition(() => {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      if (implicitPreference) setThemeState(implicitPreference)
    })
  } else {
    // Use explicit theme
    withThemeTransition(() => {
      setThemeState(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    })
  }
}, [])
```

### System Preference Detection

```typescript
const getImplicitPreference = (): Theme | null => {
  if (typeof window === 'undefined') return null

  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
```

## Event Handling

The provider listens for system preference changes to keep the theme in sync:

```typescript
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
```

## CSS Implementation

The CSS implementation relies on CSS variables and theme data attributes:

```css
:root {
  --background: 60 5% 96%;
  --foreground: 240 6% 10%;
  /* More variables... */
}

.dark {
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  /* More variables... */
}

@utility theme-transition {
  transition:
    background-color 0.3s ease-out,
    color 0.3s ease-out,
    border-color 0.3s ease-out,
    box-shadow 0.3s ease-out;
}

html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition: all 0.3s ease-out !important;
  transition-delay: 0 !important;
}
```

## Performance Considerations

- The transition is not applied to small screens for better performance.
- Uses HTML attribute selectors for theme switching to minimize style recalculations.
- Handles mounted state to avoid layout shifts during hydration.
- Leverages Tailwind v4 `@utility` directive for optimal CSS output.

## Future Improvements

Potential areas for enhancement:

- Add support for custom themes beyond light/dark
- Implement theme-specific animations
- Optimize transitions for reduced motion preferences
- Add debug mode for development

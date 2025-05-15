# Content Block with Theme Integration

The Content Block is a flexible layout component that allows editors to create multi-column content with various elements, now with seamless theme integration.

## Theme Integration

The Content Block supports three theme modes:

1. **System** - Follows the site-wide theme (light/dark) set by the user preference
2. **Light** - Forces light theme for this block, regardless of site theme
3. **Dark** - Forces dark theme for this block, regardless of site theme

### How It Works

The Content Block uses the site-wide theme system but allows content editors to override it at the block level:

```tsx
// Inside the ContentBlock component
const { theme: siteTheme } = useTheme() // Get the site-wide theme
const effectiveTheme = (() => {
  if (!mounted) return 'light' // Default for SSR
  if (theme === 'system' || !theme) {
    // Use site theme when set to "system" or not specified
    return (siteTheme || 'light') as Theme
  }
  // Otherwise use the specified theme from the CMS
  return theme as Theme
})()
```

The block uses the `data-theme` attribute and the `theme-transition` utility classes to ensure smooth transitions between themes:

```tsx
<div
  data-theme={effectiveTheme}
  className={cn(
    'theme-transition',
    spacingClasses,
    effectiveTheme === 'dark'
      ? 'bg-primary text-primary-foreground font-light'
      : 'bg-background text-foreground',
  )}
>
  {/* Content */}
</div>
```

## Usage in the CMS

When editing a Content Block in the admin panel:

1. Select the desired theme from the dropdown at the top of the block
2. Choose "System" to follow the site-wide theme setting
3. Choose "Light" or "Dark" to override the site-wide theme for this block

## Nested Components

All nested components within the Content Block (like Sliders, Cards, etc.) will automatically inherit the block's theme setting. The component handles proper className and theme prop passing to all child components.

## Best Practices

- Use "System" theme for most content to maintain consistency with user preferences
- Use theme overrides sparingly for specific design needs, such as:
  - Dark sections for visual impact or to highlight content
  - Light sections when you need maximum readability regardless of user preference
- Ensure sufficient contrast between text and background in both light and dark themes

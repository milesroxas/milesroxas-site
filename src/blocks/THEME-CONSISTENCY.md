# Theme Consistency Between Blocks

This document outlines how theme consistency is maintained between different block components in the site.

## Color System

All blocks use the same semantic color tokens to ensure visual consistency:

| Context    | Light Theme             | Dark Theme                |
| ---------- | ----------------------- | ------------------------- |
| Background | `bg-background`         | `bg-primary`              |
| Text       | `text-foreground`       | `text-primary-foreground` |
| Muted Text | `text-muted-foreground` | `text-muted-foreground`   |
| Accent     | `text-accent`           | `text-accent`             |

## Theme Implementation

### Content Block

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
```

### Slider Block

```tsx
<div
  data-theme={activeTheme}
  className={cn(
    'theme-transition w-full',
    {
      'bg-primary text-primary-foreground font-light': activeTheme === 'dark',
      'bg-background text-foreground': activeTheme === 'light',
    },
    className,
    getSpacingClasses(space),
  )}
>
```

## Theme Propagation

When a Slider is nested within a Content block, the Content block's theme is passed to the Slider:

```tsx
<SliderBlock
  blockType="slider"
  slides={col.slider.slides as any}
  style={col.slider.style || undefined}
  className="py-0"
  theme={effectiveTheme}
  introContent={filterIntroContent(col.slider.introContent)}
/>
```

This ensures that nested components maintain the same theme as their parent container.

## Best Practices

1. **Always use semantic color tokens** - Use `bg-primary` instead of `bg-black` to ensure theme consistency
2. **Use the theme-transition class** - Add smooth transitions between themes
3. **Set the data-theme attribute** - This ensures proper CSS variable inheritance
4. **Pass theme props to child components** - Ensure nested components respect the parent theme

## Testing Theme Consistency

When adding new blocks or modifying existing ones, test both light and dark themes to ensure:

1. Sufficient contrast between text and background
2. Consistent visual appearance with other blocks
3. Smooth transitions when changing themes

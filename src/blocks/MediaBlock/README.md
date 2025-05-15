# Media Block

A flexible media display component that supports both contained and full-width layouts.

## Features

- 🖼️ Supports images and videos
- 📏 Multiple aspect ratio options
- 🌊 Full-width display option that breaks out of containers
- 📝 Optional caption display
- 🔄 Original aspect ratio preservation option
- 🌈 Theme-aware with proper styling in both light and dark modes
- 📱 Responsive sizing for all screen sizes

## Usage in CMS

The Media Block can be configured with the following options:

### Media Selection

Select any image or video from the media library.

### Aspect Ratio

Choose from predefined aspect ratios or maintain the original dimensions:

- **Landscape (16:9)** - Default widescreen format
- **Square (1:1)** - Equal width and height
- **Portrait (4:5)** - Vertical format
- **Original** - Maintains the media's original aspect ratio

### Full Width Display

When enabled, the media will extend to the full width of the screen, breaking out of any container constraints.

### Caption Size

Control the size of the caption text:

- **Normal** - Standard text size
- **Large** - Larger text for emphasis
- **Extra Large** - Maximum text size for key media

### Spacing

Control the spacing around the media block with standard spacing options.

## Implementation Details

### Container Handling

```tsx
<div
  className={cn(
    spacingClasses,
    {
      'w-full': fullWidth,
      'container': enableGutter && !fullWidth,
    },
    className,
  )}
>
```

### Aspect Ratio Control

```tsx
<Media
  imgClassName={cn(imgClassName, {
    'aspect-square': useAspectRatio && aspectRatio === 'square',
    'aspect-[4/5]': useAspectRatio && aspectRatio === 'portrait',
    'aspect-[16/9]': useAspectRatio && aspectRatio === 'landscape',
    'rounded-[0.2rem]': !fullWidth,
    'w-full': true,
    'h-auto': !useAspectRatio,
    'object-cover': useAspectRatio,
    'object-contain': !useAspectRatio,
  })}
  resource={media}
  src={staticImage}
  size={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 80vw'}
  priority={true}
/>
```

### Caption Handling

When using full-width mode, captions are centered and constrained to a readable width:

```tsx
<div
  className={cn(
    'mt-6',
    {
      container: fullWidth && !disableInnerContainer,
      'mx-auto': fullWidth && !disableInnerContainer,
      'max-w-[80ch]': fullWidth && !disableInnerContainer,
    },
    captionClassName,
  )}
>
  <RichText data={caption} enableGutter={false} />
</div>
```

## Best Practices

1. **Use full-width sparingly** - Reserve it for high-impact imagery that benefits from maximum screen real estate
2. **Choose appropriate aspect ratios** - Match the aspect ratio to the content of your media
3. **Optimize images** - Even full-width images should be optimized for web delivery
4. **Consider captions** - Add descriptive captions for accessibility and context
5. **Be mindful of mobile** - Test how full-width media appears on smaller screens

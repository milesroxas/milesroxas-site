# Custom Cursor Component

A circular cursor component built with GSAP that changes appearance based on the element it hovers over.

## Setup

1. Import the `CursorProvider` component in your app root:

```tsx
import { CursorProvider } from '@/src/providers'

export default function App({ Component, pageProps }) {
  return (
    <CursorProvider>
      <Component {...pageProps} />
    </CursorProvider>
  )
}
```

2. Make sure to hide the default cursor in your global CSS:

```css
* {
  cursor: none;
}

@media (max-width: 768px) {
  * {
    cursor: auto;
  }
}
```

## Usage

Use the wrapper components to change cursor appearance on hover:

```tsx
import { CursorText, CursorButton, CursorLink, CursorMedia } from '@/src/providers'

export default function MyComponent() {
  return (
    <div>
      <CursorText>
        <p>Hovering over text changes the cursor</p>
      </CursorText>

      <CursorButton>
        <button>Click me</button>
      </CursorButton>

      <CursorLink>
        <a href="#">Link example</a>
      </CursorLink>

      <CursorMedia>
        <img src="/example.jpg" alt="Example" />
      </CursorMedia>
    </div>
  )
}
```

## Custom Integration

For more advanced use cases, use the `useCursor` hook directly:

```tsx
import { useCursor } from '@/src/providers'

export function CustomComponent() {
  const { setVariant } = useCursor()

  return (
    <div onMouseEnter={() => setVariant('media')} onMouseLeave={() => setVariant('default')}>
      Custom interaction
    </div>
  )
}
```

## Available Cursor Variants

- `default`: Standard circular cursor
- `text`: Slightly larger circle for text
- `button`: Filled circle for buttons
- `link`: Small filled circle for links
- `media`: Large circle for images/videos

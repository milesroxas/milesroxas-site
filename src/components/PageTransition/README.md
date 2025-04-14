# Page Transition Components

Simple components for creating fade and scale transitions between page navigations.

## Components

### PageTransition

Wraps your content to apply transition effects during navigation.

### TransitionLink

A drop-in replacement for Next.js `Link` that handles transition animations.

## Usage

### Basic Usage in Layout

```tsx
// app/layout.tsx
import { PageTransition } from '@/components/PageTransition';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
```

### Using TransitionLink

```tsx
// YourComponent.tsx
import { TransitionLink } from '@/components/Link';

export default function YourComponent() {
  return (
    <nav>
      <TransitionLink href="/about">
        About
      </TransitionLink>
      <TransitionLink href="/contact">
        Contact
      </TransitionLink>
    </nav>
  );
}
```

## Notes

- The transition uses a fade and scale effect with a 300ms duration
- Transitions work by preventing the default link behavior and manually navigating after the animation completes 
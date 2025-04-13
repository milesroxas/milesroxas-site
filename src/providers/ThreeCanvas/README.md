# ThreeCanvas Provider

## Overview
The ThreeCanvas provider is a modular and on-demand renderer for Three.js in React. It uses tunnel-rat to maintain a single WebGL context across all instances instead of creating isolated contexts for each canvas.

## Components & Hooks

### `ThreeCanvas`
A configurable canvas component for Three.js rendering.

```tsx
import { ThreeCanvas } from '@/providers/ThreeCanvas'

<ThreeCanvas
  fullScreen={false}
  cameraPosition={[0, 1, 5]}
  cameraFov={45}
  style={{ borderRadius: '8px' }}
  className="my-custom-class"
>
  {/* Three.js content */}
</ThreeCanvas>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | required | Three.js scene elements |
| `fullScreen` | boolean | `false` | If true, canvas will fill viewport with absolute positioning |
| `cameraPosition` | [number, number, number] | `[0, 0, 6]` | Position of the default camera |
| `cameraFov` | number | `35` | Field of view of the default camera |
| `style` | React.CSSProperties | `{}` | Additional CSS styles |
| `className` | string | `undefined` | CSS class names |

### `GlobalCanvasProvider`
A provider component that creates and maintains a single WebGL context for all ThreeCanvas instances.

```tsx
import { GlobalCanvasProvider } from '@/providers/ThreeCanvas'

function App() {
  return (
    <GlobalCanvasProvider>
      {/* The rest of your app */}
    </GlobalCanvasProvider>
  )
}
```

### `useThree`
A hook for accessing Three.js functionality from any component within the ThreeCanvas.

```tsx
import { useThree } from '@/providers/ThreeCanvas'

function MyComponent() {
  const { camera, scene, gl, createTexture } = useThree()
  
  // Use Three.js APIs here
}
```

## Usage Examples

### Basic Scene
```tsx
import { ThreeCanvas } from '@/providers/ThreeCanvas'

const MyScene = () => (
  <div className="h-64 w-full">
    <ThreeCanvas>
      <ambientLight intensity={1} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </ThreeCanvas>
  </div>
)
```

### Custom Viewport
```tsx
<div className="relative aspect-video">
  <ThreeCanvas
    fullScreen={false}
    cameraPosition={[0, 0, 4]}
  >
    {/* 3D content */}
  </ThreeCanvas>
</div>
```

### Using with Textures
```tsx
import { ThreeCanvas, useThree } from '@/providers/ThreeCanvas'

const TexturedObject = ({ imageUrl }) => {
  const { createTexture } = useThree()
  const [texture, setTexture] = useState(null)
  
  useEffect(() => {
    const loadTexture = async () => {
      const tex = await createTexture(imageUrl)
      setTexture(tex)
    }
    loadTexture()
  }, [imageUrl, createTexture])
  
  return texture ? (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  ) : null
}

const App = () => (
  <ThreeCanvas>
    <TexturedObject imageUrl="/my-image.jpg" />
  </ThreeCanvas>
)
```

## Best Practices

1. **Localized Usage**: Only use ThreeCanvas where you need 3D rendering components.

2. **Responsive Design**: Use responsive container divs to control the canvas size.

3. **Performance**:
   - The shared WebGL context improves performance by avoiding multiple contexts
   - Avoid recreating objects unnecessarily

4. **Styling**:
   - For full-page experiences, use `fullScreen={true}`
   - For embedded 3D elements, use `fullScreen={false}` and style the parent container

5. **Scene Management**:
   - Keep complex scene logic in dedicated components
   - Use the `useThree` hook to access and manipulate the scene

## Implementation Notes

- The ThreeCanvas is built on [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- Scene rendering is optimized through [tunnel-rat](https://github.com/pmndrs/tunnel-rat)
- All ThreeCanvas instances share a single WebGL context for better performance 
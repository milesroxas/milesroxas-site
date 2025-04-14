# Shader System Documentation

## Overview

This documentation explains the shader system used for displaying images with proper aspect ratio handling and visual adjustments in the project. The system consists of three main components:

1. **Shader Material** - The core GLSL shader for image handling
2. **React Hook** - For easy integration with React components 
3. **Utility Functions** - Supporting calculations for proper display

## Components

### 1. Image Crop Shader (`imageCropShader.ts`)

A custom WebGL shader that handles:
- Proper aspect ratio preservation using "cover" mode
- Brightness adjustments
- Contain/cover modes for different image display styles

```jsx
// Import in your component or hook
import '@/utilities/shaders/imageCropShader'

// Then use in a mesh
<imageCropMaterial ref={materialRef} map={texture} transparent />
```

### 2. `useImageCropMaterial` Hook

A React hook that handles all the shader material logic and uniform updates:

```jsx
const { materialRef, imgAspect, containerAspect } = useImageCropMaterial(texture, {
  aspectRatio: 'portrait',  // 'square', 'portrait', or 'landscape'
  coverMode: 0,             // 0 for "cover", 1 for "contain"
  brightness: 1.5           // Brightness multiplier
})
```

The hook returns:
- `materialRef`: Reference to the shader material (attach to mesh)
- `imgAspect`: Calculated image aspect ratio
- `containerAspect`: Container aspect ratio based on the selected mode

### 3. `calculateMeshScale` Utility

A utility function for consistent mesh scaling across the application:

```jsx
const scale = calculateMeshScale(
  imgAspect,           // Image aspect ratio
  containerAspect,     // Container aspect ratio
  aspectRatio,         // 'square', 'portrait', or 'landscape'
  baseSize             // Base size (default: 2.8)
)
```

## Complete Usage Example

```jsx
import { useTexture } from '@react-three/drei'
import { useImageCropMaterial } from '@/hooks/useImageCropMaterial'
import { calculateMeshScale } from '@/utilities/calculateMeshScale'

const MyImageComponent = ({ imageUrl }) => {
  // Load texture
  const texture = useTexture(imageUrl)
  
  // Use the hook to manage the material
  const { materialRef, imgAspect, containerAspect } = useImageCropMaterial(texture, {
    aspectRatio: 'landscape',
    brightness: 1.2
  })
  
  // Calculate proper scale
  const scale = calculateMeshScale(imgAspect, containerAspect, 'landscape')
  
  return (
    <mesh scale={scale}>
      <planeGeometry args={[1, 1]} />
      <imageCropMaterial ref={materialRef} map={texture} transparent />
    </mesh>
  )
}
```

## Reusable Component

The `TexturedPlane` component includes all the above logic for even easier use:

```jsx
import TexturedPlane from '@/components/TexturedPlane'

// In your component
<TexturedPlane 
  imageUrl="/path/to/image.jpg"
  aspectRatio="portrait"
  brightness={1.5}
  coverMode={0}
/>
```

## Supported Aspect Ratios

- `square`: 1:1 aspect ratio
- `portrait`: 4:5 aspect ratio (taller than wide)
- `landscape`: 16:9 aspect ratio (wider than tall)

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `aspectRatio` | `'square'` | The container's aspect ratio |
| `coverMode` | `0` | 0 for "cover" mode, 1 for "contain" mode |
| `brightness` | `1.5` | Brightness multiplier for the image |
| `baseSize` | `2.8` | Base scale size for the mesh | 
import type { AspectRatio } from '@/hooks/useImageCropMaterial'

/**
 * Calculate mesh scale for proper image display with Three.js
 *
 * This utility function handles the complex calculations needed to properly
 * scale a mesh based on the aspect ratios of both the image and container.
 * It ensures consistent scaling across the application, with special handling
 * for different aspect ratio modes.
 *
 * Use cases:
 * - Ensuring images display properly in 3D scenes
 * - Maintaining correct proportions when switching between aspect ratios
 * - Creating responsive 3D layouts that match CSS aspect ratios
 *
 * @param imgAspect Image aspect ratio (width/height)
 * @param containerAspect Container aspect ratio
 * @param aspectRatio Type of aspect ratio (square, portrait, landscape)
 * @param baseSize Base size of the mesh (default: 2.8)
 * @returns Scale as [x, y, z] array for use with Three.js meshes
 */
export const calculateMeshScale = (
  imgAspect: number,
  containerAspect: number,
  aspectRatio: AspectRatio,
  baseSize = 2.8,
): [number, number, number] => {
  // For portrait mode, we need special handling to ensure full width coverage
  if (aspectRatio === 'portrait') {
    // Force wider plane for portrait mode to ensure full coverage
    // The 1.1 factor compensates for potential cropping issues
    // The 5/4 ratio matches the 4:5 aspect ratio but ensures proper sizing
    return [baseSize * 1.1, baseSize * (5 / 4), 1] // Force 4:5 ratio but wider
  }

  // For landscape and square modes, use standard aspect ratio calculations
  if (imgAspect > containerAspect) {
    // Image is wider than container - adjust height to fit container width
    // We keep the x dimension constant and scale y based on the container aspect
    return [baseSize, baseSize / containerAspect, 1]
  } else {
    // Image is taller than container - adjust width to fit container height
    // We keep the y dimension constant and scale x based on the container aspect
    return [baseSize * containerAspect, baseSize, 1]
  }
}

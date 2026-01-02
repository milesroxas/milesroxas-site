'use client'

import { useEffect, useMemo, useRef } from 'react'
import type * as THREE from 'three'

import '@/utilities/shaders/imageCropShader'

/**
 * Supported aspect ratio modes for the image display
 * - square: 1:1 aspect ratio
 * - portrait: 4:5 aspect ratio (taller than wide)
 * - landscape: 16:9 aspect ratio (wider than tall)
 */
export type AspectRatio = 'square' | 'portrait' | 'landscape'

/**
 * Hook to simplify working with the ImageCropMaterial
 *
 * This hook encapsulates all the logic needed to use the custom shader:
 * - Creates and manages a reference to the material
 * - Calculates aspect ratios
 * - Updates all shader uniforms when parameters change
 *
 * @param texture - The THREE.Texture to display
 * @param options - Configuration options for the material
 * @returns Object containing material reference and aspect ratio values
 */
export const useImageCropMaterial = (
  texture: THREE.Texture | null,
  {
    aspectRatio = 'square',
    coverMode = 0,
    brightness = 1.5,
  }: {
    aspectRatio?: AspectRatio
    coverMode?: number
    brightness?: number
  } = {},
) => {
  // Material reference to access uniforms
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Calculate the source image aspect ratio (width/height)
  const imgAspect = useMemo(() => {
    if (!texture || !texture.image) return 1
    return texture.image.width / texture.image.height
  }, [texture])

  // Calculate the target container aspect ratio based on the selected mode
  const containerAspect = useMemo(() => {
    switch (aspectRatio) {
      case 'square':
        return 1 // 1:1
      case 'portrait':
        return 4 / 5 // 4:5 - Exact ratio to match CSS
      case 'landscape':
        return 16 / 9 // 16:9
      default:
        return 1
    }
  }, [aspectRatio])

  // Calculate image aspect ratio value with special handling for portrait mode
  const imageAspectValue = useMemo(() => {
    if (aspectRatio === 'portrait') {
      // Slightly increase the aspect ratio for portrait mode to ensure full width coverage
      return (imgAspect / containerAspect) * 1.05
    }
    return imgAspect / containerAspect
  }, [imgAspect, containerAspect, aspectRatio])

  // Update all shader uniforms whenever inputs change
  useEffect(() => {
    if (!materialRef.current || !texture) return

    const { uniforms } = materialRef.current
    if (!uniforms) return

    if (uniforms.map) {
      uniforms.map.value = texture
    }
    if (uniforms.imageAspect) {
      uniforms.imageAspect.value = imageAspectValue
    }
    if (uniforms.coverMode) {
      uniforms.coverMode.value = coverMode
    }
    if (uniforms.brightness) {
      uniforms.brightness.value = brightness
    }
  }, [texture, imageAspectValue, coverMode, brightness])

  // Return values needed by components using this hook
  return {
    materialRef,
    imgAspect,
    containerAspect,
  }
}

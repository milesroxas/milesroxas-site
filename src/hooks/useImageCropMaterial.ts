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

  // Update all shader uniforms whenever inputs change
  useEffect(() => {
    if (materialRef.current && texture) {
      if (materialRef.current.uniforms?.map) {
        materialRef.current.uniforms.map.value = texture
      }
      if (materialRef.current.uniforms?.imageAspect) {
        // Special adjustment for portrait mode to ensure proper coverage
        if (aspectRatio === 'portrait') {
          // Slightly increase the aspect ratio for portrait mode to ensure full width coverage
          materialRef.current.uniforms.imageAspect.value = (imgAspect / containerAspect) * 1.05
        } else {
          materialRef.current.uniforms.imageAspect.value = imgAspect / containerAspect
        }
      }
      if (materialRef.current.uniforms?.coverMode) {
        materialRef.current.uniforms.coverMode.value = coverMode
      }
      if (materialRef.current.uniforms?.brightness) {
        materialRef.current.uniforms.brightness.value = brightness
      }
    }
  }, [texture, imgAspect, containerAspect, aspectRatio, coverMode, brightness])

  // Return values needed by components using this hook
  return {
    materialRef,
    imgAspect,
    containerAspect,
  }
}

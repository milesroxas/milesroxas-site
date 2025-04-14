'use client'

import React, { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Import the useImageCropMaterial hook and utilities
import { useImageCropMaterial, AspectRatio } from '@/hooks/useImageCropMaterial'
import { calculateMeshScale } from '@/utilities/calculateMeshScale'

/**
 * Props for the TexturedPlane component
 */
type TexturedPlaneProps = {
  /** URL of the image to display */
  imageUrl: string
  /** Aspect ratio of the container (square, portrait, landscape) */
  aspectRatio?: AspectRatio
  /** Display mode: 0 for "cover" (fill and crop), 1 for "contain" (show whole image) */
  coverMode?: number
  /** Brightness multiplier for the image */
  brightness?: number
  /** Base size for the mesh scale calculation */
  baseSize?: number
  /** Optional manual scale override as [x, y, z] */
  scale?: [number, number, number]
  /** Position of the mesh in 3D space */
  position?: [number, number, number]
}

/**
 * A reusable textured plane component that uses the ImageCropShader
 * to properly display images with aspect ratio handling.
 *
 * This component combines the shader, material hook, and scaling utilities
 * into a single easy-to-use component for displaying images in 3D scenes.
 *
 * Features:
 * - Automatic aspect ratio handling
 * - Proper image cropping with "cover" mode
 * - Brightness adjustment
 * - Automatic scaling based on container aspect ratio
 * - Support for different aspect ratio modes (square, portrait, landscape)
 *
 * @example
 * ```jsx
 * <TexturedPlane
 *   imageUrl="/images/example.jpg"
 *   aspectRatio="landscape"
 *   brightness={1.2}
 * />
 * ```
 */
const TexturedPlane: React.FC<TexturedPlaneProps> = ({
  imageUrl,
  aspectRatio = 'square',
  coverMode = 0,
  brightness = 1.5,
  baseSize = 2.8,
  scale,
  position = [0, 0, 0],
}) => {
  // Load the image texture
  const texture = useTexture(imageUrl)
  const { viewport } = useThree()

  // Use our custom hook for material handling
  const { materialRef, imgAspect, containerAspect } = useImageCropMaterial(texture, {
    aspectRatio,
    coverMode,
    brightness,
  })

  // Calculate appropriate scale based on aspect ratios
  const calculatedScale = useMemo(
    () => calculateMeshScale(imgAspect, containerAspect, aspectRatio, baseSize),
    [imgAspect, containerAspect, aspectRatio, baseSize],
  )

  // Use provided scale or calculated scale
  const finalScale = scale || calculatedScale

  return (
    <mesh position={position} scale={finalScale as [number, number, number]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error - Custom material is registered at runtime */}
      <imageCropMaterial ref={materialRef} map={texture} transparent />
    </mesh>
  )
}

export default TexturedPlane

'use client'

import React, { useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { AspectRatio } from '@/hooks/useImageCropMaterial'
import { useImageCropMaterial } from '@/hooks/useImageCropMaterial'
import { calculateMeshScale } from '@/utilities/calculateMeshScale'

import '@/utilities/shaders/imageCropShader'

type HoverableCard3DProps = {
  imageUrl: string
  aspectRatio?: AspectRatio
  coverMode?: number
  brightness?: number
  baseSize?: number
  position?: [number, number, number]
  onClick?: () => void
}

/**
 * A 3D card component with animated hover effects
 * Uses the original imageCropShader but adds hover animation
 */
const HoverableCard3D: React.FC<HoverableCard3DProps> = ({
  imageUrl,
  aspectRatio = 'square',
  coverMode = 0,
  brightness = 1.5,
  baseSize = 2.8,
  position = [0, 0, 0],
  onClick,
}) => {
  // Load texture
  const texture = useTexture(imageUrl)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const hoverStrength = useRef(0)

  // Set up material with imageCropShader
  const { materialRef, imgAspect, containerAspect } = useImageCropMaterial(texture, {
    aspectRatio,
    coverMode,
    brightness,
  })

  // Calculate scale
  const scale = calculateMeshScale(imgAspect, containerAspect, aspectRatio, baseSize)
  const initialScale = new THREE.Vector3(scale[0], scale[1], scale[2])

  // Animate hover effect
  useFrame(() => {
    if (!meshRef.current) return

    // Smoothly animate hover strength
    const targetStrength = hovered ? 1.0 : 0.0
    hoverStrength.current += (targetStrength - hoverStrength.current) * 0.1

    // Apply scale animation
    const hoverScale = 1 + 0.05 * hoverStrength.current
    meshRef.current.scale.x = initialScale.x * hoverScale
    meshRef.current.scale.y = initialScale.y * hoverScale

    // Apply brightness change if material exists
    if (
      materialRef.current &&
      materialRef.current.uniforms &&
      materialRef.current.uniforms.brightness
    ) {
      materialRef.current.uniforms.brightness.value = brightness * (1 + 0.2 * hoverStrength.current)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position as any}
      scale={initialScale as any}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error - Custom material is registered at runtime */}
      <imageCropMaterial ref={materialRef} map={texture} transparent />
    </mesh>
  )
}

export default HoverableCard3D

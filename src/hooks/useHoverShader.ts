'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

import '@/utilities/shaders/hoverShader'

/**
 * Hook to manage hover shader effects
 *
 * @param baseTexture - The texture to apply the hover effect to
 * @param hoverColor - The color to tint towards on hover (default: slightly brighter white)
 * @returns Hover state and shader material reference
 */
export const useHoverShader = (
  baseTexture: THREE.Texture | null,
  hoverColor: THREE.Color = new THREE.Color(1.2, 1.2, 1.2),
) => {
  const [hovered, setHovered] = useState(false)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Smoothly animate hover strength for transitions
  const hoverStrengthRef = useRef(0)

  // Update the base texture when it changes
  useEffect(() => {
    if (materialRef.current && baseTexture && materialRef.current.uniforms) {
      if (materialRef.current.uniforms.baseTexture) {
        materialRef.current.uniforms.baseTexture.value = baseTexture
      }
      if (materialRef.current.uniforms.hoverColor) {
        materialRef.current.uniforms.hoverColor.value = hoverColor
      }
    }
  }, [baseTexture, hoverColor])

  // Animate hover strength and update time uniform for wave effect
  useFrame(({ clock }) => {
    if (materialRef.current && materialRef.current.uniforms) {
      // Update time uniform for animation
      if (materialRef.current.uniforms.time) {
        materialRef.current.uniforms.time.value = clock.getElapsedTime()
      }

      // Smoothly animate hover strength
      const targetStrength = hovered ? 1.0 : 0.0
      hoverStrengthRef.current += (targetStrength - hoverStrengthRef.current) * 0.1

      // Update hover strength uniform
      if (materialRef.current.uniforms.hoverStrength) {
        materialRef.current.uniforms.hoverStrength.value = hoverStrengthRef.current
      }
    }
  })

  // Mouse event handlers
  const onPointerOver = () => setHovered(true)
  const onPointerOut = () => setHovered(false)

  return {
    hovered,
    materialRef,
    eventHandlers: {
      onPointerOver,
      onPointerOut,
    },
  }
}

import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial, Plane } from '@react-three/drei'
import * as THREE from 'three'
import cardVert from './card.vert'
import cardFrag from './card.frag'
import { useSceneStore } from '@/r3f/store/useSceneStore'

type Props = {
  url: string
  variant?: 'wide' | 'portrait' | 'square'
  customAspect?: number
  size?: number
  cardIndex: number
}

// include our new uniform in the TS typing if you like:
type Uniforms = {
  u_texture: { value: THREE.Texture | null }
  u_time: { value: number }
  u_mouse: { value: THREE.Vector2 }
  u_resolution: { value: THREE.Vector2 }
  u_planeAspect: { value: number }
  u_progress: { value: number }
}

// 1. Define the shaderMaterial with the new uniform default
export const CardMaterial = shaderMaterial(
  {
    u_texture: null,
    u_time: 0,
    u_mouse: new THREE.Vector2(),
    u_resolution: new THREE.Vector2(),
    u_planeAspect: 1.0, // ← default
    u_progress: 0,
  },
  cardVert,
  cardFrag,
)

extend({ CardMaterial })

export default function PlaneWithImage({
  url,
  variant = 'wide',
  customAspect,
  size = 2,
  cardIndex,
}: Props) {
  const texture = useTexture(url)
  const matRef = useRef<THREE.ShaderMaterial & { uniforms: Uniforms }>(null!)

  // get hover from the store
  const hovered = useSceneStore((s) => s.hoveredIndex === cardIndex)
  const [mouseX, mouseY] = useSceneStore((s) => s.mouseUV)

  // compute this plane's aspect (width / height)
  const aspect = useMemo(() => {
    const map = { wide: 16 / 9, portrait: 3 / 4, square: 1 } as const
    return customAspect ?? map[variant] ?? map.wide
  }, [variant, customAspect])
  const width = size * aspect
  const height = size

  // when texture and material are ready, initialize uniforms
  useEffect(() => {
    if (matRef.current && texture) {
      const u = matRef.current.uniforms
      u.u_texture.value = texture
      u.u_planeAspect.value = aspect
      // also prime the initial mouse
      u.u_mouse.value.set(mouseX, mouseY)
      texture.needsUpdate = true
    }
  }, [texture, aspect])

  useFrame(({ clock, size: canvasSize }) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms

    // update time/resolution/progress
    u.u_time.value = clock.getElapsedTime()
    u.u_resolution.value.set(canvasSize.width, canvasSize.height)
    u.u_progress.value = THREE.MathUtils.lerp(u.u_progress.value, hovered ? 1 : 0, 0.03)

    // update mouse from store
    u.u_mouse.value.set(mouseX, mouseY)
  })

  return (
    <Plane args={[width, height]}>
      {/* @ts-ignore */}
      <cardMaterial ref={matRef} transparent />
    </Plane>
  )
}

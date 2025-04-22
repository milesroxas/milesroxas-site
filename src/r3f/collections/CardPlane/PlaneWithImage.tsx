import React, { type FC, useEffect, useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial, Plane } from '@react-three/drei'
import * as THREE from 'three'
import cardVert from './card.vert'
import cardFrag from './card.frag'

type Props = {
  url: string
  variant?: 'original' | 'wide' | 'portrait' | 'box'
  customAspect?: number
  size?: number
}

type Uniforms = {
  uTexture: THREE.Texture | null
  uProgress: number
}

const INITIAL_UNIFORMS: Partial<Uniforms> = {
  uTexture: null,
  uProgress: 0,
}

// Use shaderMaterial helper
const CardMaterial = shaderMaterial(INITIAL_UNIFORMS, cardVert, cardFrag)

const CardPlaneShaderMaterial = extend(CardMaterial)

export default function PlaneWithImage({
  url,
  variant = 'original',
  customAspect,
  size = 2,
}: Props) {
  const texture = useTexture(url)
  // Use the explicitly defined type for the ref
  const shaderMaterialRef = useRef<typeof CardPlaneShaderMaterial & Uniforms>(null)
  // const [isHovered, setIsHovered] = useState(false)
  const progress = useRef(0)

  const aspectRatios: Record<string, number> = {
    original: 1064 / 625,
    wide: 16 / 9,
    portrait: 3 / 4,
    box: 1 / 1,
  }

  const aspect = customAspect ?? aspectRatios[variant] ?? 1
  const width = size * aspect
  const height = size

  // Set the texture when it's loaded
  useEffect(() => {
    // Use optional chaining for safer access
    if (shaderMaterialRef.current?.uTexture && texture) {
      shaderMaterialRef.current.uTexture = texture
    }
  }, [texture])

  console.log(shaderMaterialRef.current)

  return (
    <Plane args={[width, height]}>
      <CardPlaneShaderMaterial
        key={CardMaterial.key}
        ref={shaderMaterialRef}
        {...INITIAL_UNIFORMS}
      />
    </Plane>
  )
}

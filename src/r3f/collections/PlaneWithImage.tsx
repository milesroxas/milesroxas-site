import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import type { ReactThreeFiber } from '@react-three/fiber'

type Props = {
  url: string
  variant?: 'original' | 'wide' | 'portrait'
  customAspect?: number
  size?: number
}

export default function PlaneWithImage({
  url,
  variant = 'original',
  customAspect,
  size = 2,
}: Props) {
  const texture = useTexture(url)
  const materialRef = useRef<any>(null)
  const [isHovered, setIsHovered] = useState(false)
  const progress = useRef(0)
  const meshRef = useRef<THREE.Mesh>(null)

  // Set the CSS cursor to pointer when hovered
  useCursor(isHovered)

  const aspectRatios = {
    original: 1064 / 625,
    wide: 16 / 9,
    portrait: 3 / 4,
    box: 1 / 1,
  }

  const aspect = customAspect ?? aspectRatios[variant]
  const width = size * aspect
  const height = size

  const material = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uProgress: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uProgress;
        varying vec2 vUv;
        vec2 warpUv(vec2 uv, float amt) {
          float angle = sin(uv.y * 3.1415 + amt * 2.0) * 0.01 * amt;
          uv.x += angle;
          uv.y += sin(uv.x * 3.1415 + amt * 2.0) * 0.01 * amt;
          return uv;
        }
        void main() {
          float progress = smoothstep(0.0, 1.0, uProgress);
          float aberration = 0.015 * progress;
          vec2 uv = vUv;
          uv = warpUv(uv, progress);
          float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
          float g = texture2D(uTexture, uv).g;
          float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;
          vec3 color = vec3(r, g, b);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      toneMapped: false,
    }),
  )

  // Set texture uniform on load
  useEffect(() => {
    if (texture && material.current.uniforms?.uTexture) {
      material.current.uniforms.uTexture.value = texture
    }
  }, [texture])

  const handlePointerOver = () => {
    console.log('Pointer over')
    setIsHovered(true)
  }

  const handlePointerOut = () => {
    console.log('Pointer out')
    setIsHovered(false)
  }

  useFrame((_, delta) => {
    const target = isHovered ? 1 : 0
    progress.current += (target - progress.current) * Math.min(1, delta * 4)
    if (material.current.uniforms?.uProgress) {
      material.current.uniforms.uProgress.value = progress.current
    }
  })

  // Log mesh ref on mount
  useEffect(() => {
    if (meshRef.current) {
      console.log('Mesh ref:', meshRef.current)
    }
  }, [])

  return (
    <mesh ref={meshRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <planeGeometry args={[width, height]} />
      <primitive object={material.current} attach="material" />
    </mesh>
  )
}

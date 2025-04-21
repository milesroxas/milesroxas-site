import { useRef, useState } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { ReactThreeFiber } from '@react-three/fiber'

type Props = {
  url: string
  variant?: 'original' | 'wide' | 'portrait'
  customAspect?: number
  size?: number
}

const DistortMaterial = shaderMaterial(
  {
    uTexture: null,
    uProgress: 0,
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D uTexture;
    uniform float uProgress;
    varying vec2 vUv;
    
    // Simple chromatic aberration and warp
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
      // Warp
      uv = warpUv(uv, progress);
      // Chromatic aberration: offset each channel
      float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;
      vec3 color = vec3(r, g, b);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
)

export default function PlaneWithImage({
  url,
  variant = 'original',
  customAspect,
  size = 1.5,
}: Props) {
  const texture = useTexture(url)
  const materialRef = useRef<any>(null)
  const [isHovered, setIsHovered] = useState(false)
  const progress = useRef(0)

  const aspectRatios = {
    original: 1064 / 625,
    wide: 16 / 9.5,
    portrait: 3 / 4,
  }

  const aspect = customAspect ?? aspectRatios[variant]
  const isPortrait = aspect < 1
  const width = isPortrait ? size * aspect : size
  const height = isPortrait ? size : size / aspect

  useFrame((_, delta) => {
    const target = isHovered ? 1 : 0
    progress.current += (target - progress.current) * Math.min(1, delta * 4)
    if (materialRef.current) {
      materialRef.current.uProgress = progress.current
    }
  })

  return (
    <mesh onPointerOver={() => setIsHovered(true)} onPointerOut={() => setIsHovered(false)}>
      <planeGeometry args={[width, height]} />
      <distortMaterial ref={materialRef} uTexture={texture} uProgress={0} toneMapped={false} />
    </mesh>
  )
}

// Register the material for JSX
extend({ DistortMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    distortMaterial: any
  }
}

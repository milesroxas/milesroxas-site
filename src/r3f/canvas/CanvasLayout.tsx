'use client'
import { Canvas } from '@react-three/fiber'
import SceneManager from '@/r3f/canvas/SceneManager'

export default function CanvasLayout() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}
      camera={{ position: [0, 0, 3], fov: 30 }}
    >
      <SceneManager />
    </Canvas>
  )
}

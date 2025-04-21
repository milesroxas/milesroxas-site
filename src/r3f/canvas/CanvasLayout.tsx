'use client'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneManager from '@/r3f/canvas/SceneManager'

export default function CanvasLayout() {
  const eventSourceRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={eventSourceRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 3], fov: 30 }}
        eventSource={eventSourceRef as React.RefObject<HTMLElement>}
      >
        <SceneManager />
      </Canvas>
    </div>
  )
}

'use client'

import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import createTunnel from 'tunnel-rat'

// Create a tunnel for Three.js content
export const threeTunnel = createTunnel()

// Props for the GlobalCanvasProvider
type GlobalCanvasProviderProps = {
  children: React.ReactNode
  eventSource?: React.RefObject<HTMLElement>
}

// Global canvas provider that creates a single WebGL context
export const GlobalCanvasProvider: React.FC<GlobalCanvasProviderProps> = ({
  children,
  eventSource,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {/* This is the single Canvas instance that will be shared */}
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        linear
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'none',
          zIndex: -1,
        }}
        dpr={[0.75, 1.5]} // Reduce min DPR for better performance
        eventSource={containerRef as unknown as React.RefObject<HTMLElement>}
        performance={{ min: 0.5 }} // Allow ThreeJS to reduce quality during low FPS
      >
        <Suspense fallback={null}>
          {/* This is where all tunneled content will appear */}
          <color attach="background" args={['#ffffff']} />
          <threeTunnel.Out />
        </Suspense>
      </Canvas>
      <div ref={containerRef} className="w-full h-full">
        {children}
      </div>
    </>
  )
}

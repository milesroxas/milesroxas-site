'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, useProgress } from '@react-three/drei'

// Simple, minimal loader for components inside the canvas
// This is different from the main site loader
const CanvasInternalLoader = () => {
  return (
    <Html center>
      <div className="w-6 h-6 rounded-full border-2 border-t-accent border-r-accent border-b-transparent border-l-transparent animate-spin" />
    </Html>
  )
}

// Error fallback component
const ErrorFallback = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="text-xs text-red-500 font-mono">Failed to load 3D content</div>
    </div>
  )
}

// Simplified component that just provides the Canvas
export const ThreeCanvas: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [domReady, setDomReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Make sure we're in the browser before rendering Canvas
  useEffect(() => {
    setDomReady(true)

    // Add global error handler for WebGL context lost
    const handleError = () => {
      setHasError(true)
    }

    window.addEventListener('webglcontextlost', handleError)

    return () => {
      window.removeEventListener('webglcontextlost', handleError)
    }
  }, [])

  if (hasError) {
    return <ErrorFallback />
  }

  if (!domReady) {
    return <div className="w-full h-full bg-gray-100" />
  }

  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      camera={{
        position: [0, 0, 6], // Moved camera back to see more of the scene
        fov: 35, // Reduced FOV for less perspective distortion
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 1.5]} // Reduced from [1, 2] to improve performance
      onError={(error) => {
        console.error('Canvas error:', error)
        setHasError(true)
      }}
    >
      <Suspense fallback={<CanvasInternalLoader />}>{children}</Suspense>
    </Canvas>
  )
}

// Maintain provider for backward compatibility
export const ThreeCanvasProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <>{children}</>
}

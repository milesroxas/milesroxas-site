'use client'

import React from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { threeTunnel } from './GlobalCanvas'

export { GlobalCanvasProvider, threeTunnel } from './GlobalCanvas'

export type ThreeCanvasProps = {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  fullScreen?: boolean
  cameraPosition?: [number, number, number]
  cameraFov?: number
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  children,
  style,
  className,
  fullScreen = false,
  cameraPosition = [0, 0, 6],
  cameraFov = 35,
}) => {
  const defaultStyle: React.CSSProperties = fullScreen
    ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }
    : { width: '100%', height: '100%', zIndex: 1 }

  return (
    <div style={{ ...defaultStyle, ...style }} className={className}>
      <threeTunnel.In>
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={cameraFov}
          near={0.1}
          far={100}
        />
        {children}
      </threeTunnel.In>
    </div>
  )
}

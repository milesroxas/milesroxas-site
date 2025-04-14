'use client'

import React, { useEffect, useRef } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { threeTunnel } from './GlobalCanvas'
import { useThree } from '@react-three/fiber'

export { GlobalCanvasProvider, threeTunnel } from './GlobalCanvas'

// Component to trigger updates when container moves
const ViewportObserver = ({ elementRef }: { elementRef: React.RefObject<HTMLElement> }) => {
  const { invalidate } = useThree()

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length > 0 && entries[0]?.isIntersecting) {
          invalidate()
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, invalidate])

  return null
}

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
  const containerRef = useRef<HTMLDivElement>(null)
  const defaultStyle: React.CSSProperties = fullScreen
    ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }
    : { width: '100%', height: '100%', zIndex: 1 }

  return (
    <div ref={containerRef} style={{ ...defaultStyle, ...style }} className={className}>
      <threeTunnel.In>
        <ViewportObserver elementRef={containerRef as React.RefObject<HTMLElement>} />
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

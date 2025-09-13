import * as THREE from 'three/webgpu'
import { Canvas, CanvasProps } from '@react-three/fiber'

export const WebGPUCanvas = (props: CanvasProps) => {
  return (
    <Canvas
      {...props}
      flat
      gl={async (glProps) => {
        const renderer = new THREE.WebGPURenderer(
          glProps as ConstructorParameters<typeof THREE.WebGPURenderer>[0],
        )
        await renderer.init()
        return renderer
      }}
    >
      {props.children}
    </Canvas>
  )
}

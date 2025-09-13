import type { ReactThreeFiber } from '@react-three/fiber'
import * as THREE from 'three'

// ← point to the real file via your TS alias
import { CardMaterial } from './r3f/components/CardPlane/PlaneWithImage'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // name must exactly match the lower‑cased key passed to extend()
      cardMaterial: ReactThreeFiber.Object3DNode<typeof CardMaterial, THREE.ShaderMaterial>
    }
  }
}

declare global {
  interface Window {
    __PAGE_TRANSITION_CLONE?: HTMLElement
    __PAGE_TRANSITION_SCROLL_DATA?: {
      scrollY: number
      scrollX: number
    }
  }
}

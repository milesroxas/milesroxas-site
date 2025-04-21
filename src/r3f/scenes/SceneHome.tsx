'use client'

import { View } from '@react-three/drei'
import type { SceneTrackRefs } from '@/r3f/types/r3f'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import PlaneWithImage from '../collections/PlaneWithImage'
type Props = {
  trackedRefs: SceneTrackRefs
  resource: {
    url: string
    variant: 'original' | 'wide' | 'portrait'
  }
  collection: {
    variant: 'post' | 'work'
  }
}

export default function SceneHome({ trackedRefs, resource, collection }: Props) {
  const texture = useTexture('/textures/fpo-arturo.jpg')

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      {/* Hero mesh */}
      {trackedRefs.heroSection && (
        <View track={trackedRefs.heroSection as unknown as React.RefObject<HTMLElement>}>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.5, 0.2, 16, 100]} />
            <meshStandardMaterial color="cyan" />
          </mesh>
        </View>
      )}

      {/* Card meshes */}
      {trackedRefs.cards?.map((ref, i) =>
        ref ? (
          <View key={i} track={ref as unknown as React.RefObject<HTMLElement>}>
            <ambientLight intensity={1} />
            <PlaneWithImage url={resource.url} variant={resource.variant} size={2} />
          </View>
        ) : null,
      )}
    </>
  )
}

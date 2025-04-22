'use client'

import { View } from '@react-three/drei'
import type { SceneTrackRefs } from '@/r3f/types/r3f'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import PlaneWithImage from '@/r3f/components/CardPlane/PlaneWithImage'

type Props = {
  trackedRefs: SceneTrackRefs
  resources: {
    url: string
    variant: 'original' | 'wide' | 'portrait'
  }[]
  collections: {
    variant: 'post' | 'work'
  }[]
}

export default function SceneHome({ trackedRefs, resources, collections }: Props) {
  const texture = useTexture('/textures/fpo-arturo.jpg')

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      {/* Hero mesh */}
      {trackedRefs.heroSection && (
        <View track={trackedRefs.heroSection as React.RefObject<HTMLElement>}>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.5, 0.2, 16, 100]} />
            <meshStandardMaterial map={texture} />
          </mesh>
        </View>
      )}

      {/* Card meshes */}
      {trackedRefs.cards?.map((ref, i) =>
        ref && resources[i] ? (
          <View key={i} track={ref as React.RefObject<HTMLElement>}>
            <ambientLight intensity={1} />
            <PlaneWithImage
              url={resources[i]!.url}
              variant={resources[i]!.variant}
              size={1}
              cardIndex={i}
            />
          </View>
        ) : null,
      )}
    </>
  )
}

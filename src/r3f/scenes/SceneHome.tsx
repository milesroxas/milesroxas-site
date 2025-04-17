'use client'

import { View } from '@react-three/drei'
import type { SceneTrackRefs } from '@/r3f/types/r3f'

type Props = {
  trackedRefs: SceneTrackRefs
}

export default function SceneHome({ trackedRefs }: Props) {
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
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          </View>
        ) : null,
      )}

      {/* Banner mesh */}
      {trackedRefs.banner && (
        <View track={trackedRefs.banner as unknown as React.RefObject<HTMLElement>}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="pink" />
          </mesh>
        </View>
      )}
    </>
  )
}

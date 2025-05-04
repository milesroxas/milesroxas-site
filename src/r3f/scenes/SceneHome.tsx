'use client'

import { View } from '@react-three/drei'
import type { SceneTrackRefs } from '@/r3f/types/r3f'
import PlaneWithImage from '@/r3f/components/CardPlane/PlaneWithImage'

type Props = {
  trackedRefs: SceneTrackRefs
  resources: {
    url: string
    variant: 'wide' | 'portrait' | 'square'
  }[]
  collections: {
    variant: 'post' | 'work'
  }[]
}

export default function SceneHome({ trackedRefs, resources }: Props) {
  // const texture = useTexture('/textures/fpo-arturo.jpg')

  return (
    <>
      {/* Scene Home Cards - Only render if we have both ref and matching resource */}
      {trackedRefs.cards?.map((ref, i) =>
        ref && resources[i] ? (
          <View key={i} track={ref as React.RefObject<HTMLElement>}>
            <ambientLight intensity={1} />
            <PlaneWithImage
              url={resources[i].url}
              variant={resources[i].variant}
              size={1}
              cardIndex={i}
            />
          </View>
        ) : null,
      )}
    </>
  )
}

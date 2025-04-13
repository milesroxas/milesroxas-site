'use client'

import React, { useMemo, useRef } from 'react'
import { useTexture, View, PerspectiveCamera, shaderMaterial } from '@react-three/drei'
import { extend, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Link from 'next/link'

import { ThreeCanvas } from '@/providers/ThreeCanvas'
import useClickableCard from '@/utilities/useClickableCard'
import { cn } from '@/utilities/ui'
import { getImageURL } from '@/utilities/getImageURL'

import type { Post, Work } from '@/payload-types'

// Common fields needed for both Work and Post types
export type ContentCardData =
  | (Pick<Work, 'slug' | 'categories' | 'meta' | 'title'> & { type?: 'work' })
  | (Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'> & { type?: 'post' })

export type AspectRatio = 'square' | 'portrait' | 'landscape'

// Custom shader material for proper image cropping
const ImageCropMaterial = shaderMaterial(
  {
    map: null,
    imageAspect: 1.0,
    coverMode: 0, // 0: cover, 1: contain
    brightness: 1.5, // Increased brightness adjustment for better visibility
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform sampler2D map;
    uniform float imageAspect;
    uniform float coverMode;
    uniform float brightness;
    varying vec2 vUv;
    
    void main() {
      // Center the UV coordinates
      vec2 centeredUv = vUv - 0.5;
      
      // Adjust UVs to maintain aspect ratio (cover mode)
      // This crops the image properly rather than stretching
      vec2 adjustedUv;
      
      if (coverMode < 0.5) {
        // Cover mode - we fill the container and crop if needed
        adjustedUv = centeredUv;
        
        // Modify the scaling factor to show more of the image
        // This uses the inverse of imageAspect to maintain proportions
        // while showing more of the image content
        if (imageAspect > 1.0) {
          // Image is wider than container - scale horizontal UV
          adjustedUv.x *= imageAspect * 0.85; // 0.85 factor shows more of image width
        } else {
          // Image is taller than container - scale vertical UV
          adjustedUv.y /= imageAspect * 0.85; // 0.85 factor shows more of image height
        }
      } else {
        // Contain mode - we fit the whole image
        adjustedUv = centeredUv;
      }
      
      // Move back from center coord system to 0-1
      adjustedUv += 0.5;
      
      // Discard pixels outside 0-1 range (the cropped part)
      if(adjustedUv.x < 0.0 || adjustedUv.x > 1.0 || adjustedUv.y < 0.0 || adjustedUv.y > 1.0) {
        discard;
      }
      
      // Get the texture color (unaffected by lighting)
      vec4 texColor = texture2D(map, adjustedUv);
      
      // Apply brightness adjustment while preventing over-brightening
      vec3 brightColor = texColor.rgb * brightness;
      
      // Ensure we don't exceed maximum brightness
      brightColor = min(brightColor, vec3(1.0));
      
      // Output the brightened color
      gl_FragColor = vec4(brightColor, texColor.a);
    }
  `,
)

// Register the material
extend({ ImageCropMaterial })

// Add the types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      imageCropMaterial: any
    }
  }
}

// 3D Plane component that renders the image with shader
const ImagePlane = ({
  imageUrl,
  aspectRatio,
  index = 0,
}: {
  imageUrl: string
  aspectRatio: AspectRatio
  index?: number
}) => {
  const texture = useTexture(imageUrl)
  const { viewport } = useThree()

  // Calculate the image aspect ratio
  const imgAspect = useMemo(() => {
    if (!texture || !texture.image) return 1
    return texture.image.width / texture.image.height
  }, [texture])

  // Get container aspect ratio based on the aspectRatio prop
  const containerAspect = useMemo(() => {
    switch (aspectRatio) {
      case 'square':
        return 1 // 1:1
      case 'portrait':
        return 4 / 5 // 4:5 - Exact ratio to match CSS
      case 'landscape':
        return 16 / 9 // 16:9
      default:
        return 1
    }
  }, [aspectRatio])

  // Calculate scaling factor for the mesh to maintain aspect ratio
  const scale = useMemo(() => {
    // Increase base size for better coverage
    const BASE_SIZE = 2.8

    // For portrait mode, we need to ensure full width coverage
    if (aspectRatio === 'portrait') {
      // Force wider plane for portrait mode to ensure full coverage
      return [BASE_SIZE * 1.1, BASE_SIZE * (5 / 4), 1] // Force 4:5 ratio but wider
    }

    // For other modes, use standard calculation
    if (imgAspect > containerAspect) {
      // Image is wider than container - adjust height to fit container width
      return [BASE_SIZE, BASE_SIZE / containerAspect, 1]
    } else {
      // Image is taller than container - adjust width to fit container height
      return [BASE_SIZE * containerAspect, BASE_SIZE, 1]
    }
  }, [imgAspect, containerAspect, aspectRatio])

  // Material reference to update uniforms
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Update material uniforms when texture or aspect changes
  React.useEffect(() => {
    if (materialRef.current && texture) {
      if (materialRef.current.uniforms && materialRef.current.uniforms.map) {
        materialRef.current.uniforms.map.value = texture
      }
      if (materialRef.current.uniforms && materialRef.current.uniforms.imageAspect) {
        // Special adjustment for portrait mode to ensure proper coverage
        if (aspectRatio === 'portrait') {
          // Slightly increase the aspect ratio for portrait mode to ensure full width coverage
          materialRef.current.uniforms.imageAspect.value = (imgAspect / containerAspect) * 1.05
        } else {
          materialRef.current.uniforms.imageAspect.value = imgAspect / containerAspect
        }
      }
    }
  }, [texture, imgAspect, containerAspect, aspectRatio])

  return (
    <mesh position={[0, 0, 0]} scale={scale as [number, number, number]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore - Custom material is registered at runtime */}
      <imageCropMaterial ref={materialRef} map={texture} transparent />
    </mesh>
  )
}

export const ContentCard3D: React.FC<{
  className?: string
  doc?: ContentCardData
  relationTo?: 'works' | 'posts'
  showCategories?: boolean
  aspectRatio?: AspectRatio
  isFlipped?: boolean
  type?: 'post' | 'work'
  fullWidth?: boolean
}> = ({
  className,
  doc,
  relationTo = 'works',
  showCategories = true,
  aspectRatio = 'square',
  isFlipped = false,
  type: explicitType,
  fullWidth = false,
}) => {
  const { card, link } = useClickableCard({})
  const viewRef = useRef<HTMLDivElement>(null)

  // Memoize camera to avoid recreating it on each render
  const camera = useMemo(
    () => <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={35} near={0.1} far={1000} />,
    [],
  )

  // Memoize light to avoid recreating it on each render
  const light = useMemo(() => <ambientLight intensity={2} />, [])

  if (!doc) return null

  const { slug, categories = [], meta, title } = doc

  // Determine image source based on content type
  const docType = explicitType || (doc as any).type || (relationTo === 'posts' ? 'post' : 'work')
  const imageResource =
    docType === 'post' && 'heroImage' in doc && doc.heroImage ? doc.heroImage : meta?.image || null

  const imageUrl = getImageURL(imageResource)
  const href = `/${relationTo}/${slug}`

  // Format categories for display
  const categoriesToUse = categories?.map((category: any) => {
    if (typeof category === 'object' && category !== null) return category.title
    return category
  })

  // Define aspect ratio classes with responsive breakpoints
  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-square md:aspect-[4/5]',
    landscape: 'aspect-square md:aspect-[16/9]',
  }

  const titleStyles = docType === 'post' ? 'text-lg' : 'text-3xl font-light'
  const widthClass = fullWidth ? 'w-full' : className || 'w-full'

  return (
    <article className={widthClass} ref={card.ref}>
      <div className={cn('content-card', isFlipped && 'flex flex-col-reverse')}>
        <Link href={href} ref={link.ref} className="block h-full">
          <div
            className={cn(
              aspectRatioClasses[aspectRatio],
              'overflow-hidden relative w-full mb-2',
              // Different background color based on card type for better visibility
              docType === 'post' ? 'bg-gray-200' : 'bg-gray-100',
            )}
          >
            <div ref={viewRef} className="absolute inset-0" style={{ zIndex: 0 }}>
              {imageUrl ? (
                <ThreeCanvas
                  style={{ backgroundColor: docType === 'post' ? '#e5e7eb' : '#f3f4f6' }}
                >
                  <View track={viewRef as unknown as React.RefObject<HTMLElement>}>
                    {camera}
                    {light}
                    <ImagePlane imageUrl={imageUrl} aspectRatio={aspectRatio} />
                  </View>
                </ThreeCanvas>
              ) : (
                <div className="w-full h-full bg-gray-200 z-[-1]" />
              )}
            </div>
          </div>

          <div
            className={cn('flex gap-2 justify-between items-center', isFlipped ? 'mb-4' : 'mt-4')}
          >
            <h3 className={titleStyles}>{title}</h3>
            {showCategories && categories && categories.length > 0 && (
              <div className="flex gap-2">
                {categoriesToUse?.map((category: string) => (
                  <div key={category} className="text-sm uppercase font-mono text-accent">
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </article>
  )
}

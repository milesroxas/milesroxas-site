'use client'

import React, { useRef, useState, useLayoutEffect, useMemo, Suspense, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useCursor, useTexture, Html, useProgress } from '@react-three/drei'
import Link from 'next/link'
import * as THREE from 'three'

import { ThreeCanvas } from '@/providers/ThreeCanvas'
import useClickableCard from '@/utilities/useClickableCard'
import { cn } from '@/utilities/ui'
import { getImageURL } from '@/utilities/getImageURL'
import { useLoading } from '@/providers/LoadingProvider'

import type { Post, Work } from '@/payload-types'

// Create a shared loading manager for all textures
const globalLoadingManager = new THREE.LoadingManager()

// Configure the global loading manager
globalLoadingManager.onLoad = () => {
  // Wait a short delay to ensure all textures are rendered
  setTimeout(() => {
    // Signal that all textures are loaded and rendered
    window.dispatchEvent(new Event('textures:loaded'))
    window.dispatchEvent(new Event('site:loaded'))
  }, 300)
}

// Common fields needed for both Work and Post types
export type ContentCardData =
  | (Pick<Work, 'slug' | 'categories' | 'meta' | 'title'> & { type?: 'work' })
  | (Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'> & { type?: 'post' })

export type AspectRatio = 'square' | 'portrait' | 'landscape'

// 3D Plane component that renders the image with shader
const ImagePlane = ({
  imageUrl,
  aspectRatio = 'square',
}: {
  imageUrl: string
  aspectRatio: AspectRatio
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [textureError, setTextureError] = useState(false)
  const [textureInfo, setTextureInfo] = useState<{
    texture: THREE.Texture | null
    aspectRatio: number
  }>({ texture: null, aspectRatio: 1 })
  useCursor(hovered)

  // Calculate the appropriate plane size based on aspect ratio
  const planeSize = useMemo(() => {
    switch (aspectRatio) {
      case 'portrait':
        return { width: 3, height: 3.75 }
      case 'landscape':
        // Adjusted landscape aspect ratio for proper display
        return { width: 4, height: 2.25 }
      case 'square':
      default:
        return { width: 3, height: 3 }
    }
  }, [aspectRatio])

  useEffect(() => {
    // Register this texture with the global loading manager
    const loader = new THREE.TextureLoader(globalLoadingManager)
    loader.crossOrigin = 'anonymous'

    try {
      loader.load(
        imageUrl,
        (loadedTexture) => {
          // Calculate image aspect ratio
          const imageAspect = loadedTexture.image.width / loadedTexture.image.height

          // Optimize texture settings
          loadedTexture.wrapS = loadedTexture.wrapT = THREE.ClampToEdgeWrapping
          loadedTexture.minFilter = THREE.LinearFilter
          loadedTexture.magFilter = THREE.LinearFilter
          loadedTexture.needsUpdate = true

          setTextureInfo({
            texture: loadedTexture,
            aspectRatio: imageAspect,
          })
        },
        undefined,
        (error) => {
          console.error('Error loading texture in ImagePlane:', error)
          setTextureError(true)
        },
      )
    } catch (error) {
      console.error('Exception loading texture:', error)
      setTextureError(true)
    }

    return () => {
      if (textureInfo.texture) {
        textureInfo.texture.dispose()
      }
    }
  }, [imageUrl])

  // Create custom shader material with the loaded texture - kept before conditional returns
  const shaderMaterial = useMemo(() => {
    if (!textureInfo.texture) return null

    // Calculate container aspect ratio
    const containerAspect = planeSize.width / planeSize.height

    // Calculate scale factors to ensure proper center cropping
    // These scale factors are used to scale the UV coordinates
    let scaleFactorX = 1
    let scaleFactorY = 1

    if (textureInfo.aspectRatio > containerAspect) {
      // Image is wider than container - scale to height and crop width
      scaleFactorX = containerAspect / textureInfo.aspectRatio
      scaleFactorX = 1 / scaleFactorX // Invert for UV scaling
    } else {
      // Image is taller than container - scale to width and crop height
      scaleFactorY = textureInfo.aspectRatio / containerAspect
      scaleFactorY = 1 / scaleFactorY // Invert for UV scaling
    }

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: textureInfo.texture },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uImageAspect: { value: textureInfo.aspectRatio },
        uContainerAspect: { value: containerAspect },
        uScaleX: { value: scaleFactorX },
        uScaleY: { value: scaleFactorY },
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uHover;
        uniform float uImageAspect;
        uniform float uContainerAspect;
        uniform float uScaleX;
        uniform float uScaleY;
        varying vec2 vUv;
        
        void main() {
          // Center-crop the image by scaling UV coordinates
          vec2 uv = vUv;
          
          // Scale from center
          uv.x = 0.5 + (uv.x - 0.5) / uScaleX;
          uv.y = 0.5 + (uv.y - 0.5) / uScaleY;
          
          // Apply hover distortion to original UVs to maintain proper scaling
          if (uHover > 0.0) {
            float wavex = sin(vUv.y * 10.0 + uTime) * 0.02 * uHover;
            float wavey = sin(vUv.x * 10.0 + uTime) * 0.02 * uHover;
            uv.x += wavex;
            uv.y += wavey;
          }
          
          // Only show pixels within the valid texture range
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
            vec4 color = texture2D(uTexture, uv);
            gl_FragColor = color;
          }
        }
      `,
      transparent: true,
    })
  }, [textureInfo.texture, textureInfo.aspectRatio, planeSize])

  // Update shader uniforms - kept before conditional returns
  useFrame((state) => {
    if (shaderMaterial && 'uniforms' in shaderMaterial && meshRef.current) {
      // Update time uniform for animation
      if (shaderMaterial.uniforms.uTime) {
        shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime()
      }

      // Smooth transition for hover with improved easing
      if (shaderMaterial.uniforms.uHover) {
        const easingFactor = 0.05 // Lower value = slower, smoother transition
        shaderMaterial.uniforms.uHover.value = THREE.MathUtils.lerp(
          shaderMaterial.uniforms.uHover.value,
          hovered ? 1.0 : 0.0,
          easingFactor,
        )
      }

      // Add subtle rotation on hover with easing
      const targetRotation = hovered ? Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05 : 0
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation,
        0.05,
      )
    }
  })

  // Show fallback if texture loading failed
  if (textureError) {
    return (
      <mesh scale={[planeSize.width, planeSize.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#f0f0f0" />
        <Html center>
          <div className="text-xs text-gray-500">Failed to load</div>
        </Html>
      </mesh>
    )
  }

  // Show placeholder until texture is loaded
  if (!textureInfo.texture) {
    return (
      <mesh scale={[planeSize.width, planeSize.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#f8f8f8" />
      </mesh>
    )
  }

  // If shader material creation failed, show basic material with proper center crop
  if (!shaderMaterial) {
    // Create a basic material with proper texture settings
    const material = new THREE.MeshBasicMaterial({
      map: textureInfo.texture,
    })

    // Calculate container aspect ratio
    const containerAspect = planeSize.width / planeSize.height

    // Center crop by adjusting texture settings
    if (textureInfo.aspectRatio > containerAspect) {
      // Image is wider than container - fit height, crop width
      const ratio = containerAspect / textureInfo.aspectRatio
      textureInfo.texture.repeat.set(ratio, 1)
      textureInfo.texture.offset.set((1 - ratio) / 2, 0)
    } else {
      // Image is taller than container - fit width, crop height
      const ratio = textureInfo.aspectRatio / containerAspect
      textureInfo.texture.repeat.set(1, ratio)
      textureInfo.texture.offset.set(0, (1 - ratio) / 2)
    }

    return (
      <mesh ref={meshRef} scale={[planeSize.width, planeSize.height, 1]}>
        <planeGeometry />
        <primitive object={material} attach="material" />
      </mesh>
    )
  }

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[planeSize.width, planeSize.height, 1]}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[planeSize.width, planeSize.height, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
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
}> = (props) => {
  const { card, link } = useClickableCard({})
  const {
    className,
    doc,
    relationTo = 'works',
    showCategories = true,
    aspectRatio = 'square',
    isFlipped = false,
    type: explicitType,
    fullWidth = false,
  } = props

  const [mounted, setMounted] = useState(false)

  // Only track mounting state
  useLayoutEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!doc) return null

  const { slug, categories = [], meta, title } = doc

  // Determine image source based on content type
  const docType = explicitType || (doc as any).type || (relationTo === 'posts' ? 'post' : 'work')
  const imageResource =
    docType === 'post' && 'heroImage' in doc && doc.heroImage ? doc.heroImage : meta?.image || null

  // Get the image URL using our utility function
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
          {/* 3D Image section */}
          <div
            className={cn(
              aspectRatioClasses[aspectRatio],
              'overflow-hidden relative w-full mb-2 bg-gray-100',
            )}
          >
            {mounted && (
              <div
                style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}
              >
                <ThreeCanvas>
                  <ambientLight intensity={1} />
                  {imageUrl ? (
                    <ImagePlane imageUrl={imageUrl} aspectRatio={aspectRatio} />
                  ) : (
                    <Html center>
                      <div className="text-xs">No image</div>
                    </Html>
                  )}
                </ThreeCanvas>
              </div>
            )}
          </div>

          {/* Content section */}
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

          {/* Visual indicator of content type */}
          {docType === 'post' && (
            <div className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded-full">
              Post
            </div>
          )}
        </Link>
      </div>
    </article>
  )
}

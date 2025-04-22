import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  url: string
  variant?: 'original' | 'wide' | 'portrait'
  customAspect?: number
  size?: number
  forcedHover?: boolean
}

// Create shader material for hover effect with distortion
const DistortMaterial = shaderMaterial(
  {
    uTexture: null,
    uProgress: 0,
    uTransition: 0, // New transition uniform
    uPrevTexture: null, // Previous texture for smooth transitions
  },
  // vertex shader
  `
    varying vec2 vUv;
    uniform float uProgress;
    
    void main() {
      vUv = uv;
      
      // Add slight bulge effect on hover
      vec3 pos = position;
      float bulge = uProgress * 0.03; // Subtle bulge amount
      pos.z += bulge * sin(position.x * 3.14159) * sin(position.y * 3.14159);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D uTexture;
    uniform sampler2D uPrevTexture;
    uniform float uProgress;
    uniform float uTransition;
    varying vec2 vUv;
    
    // Enhanced chromatic aberration and warp
    vec2 warpUv(vec2 uv, float amt) {
      float angle = sin(uv.y * 3.1415 + amt * 2.0) * 0.03 * amt;
      uv.x += angle;
      uv.y += sin(uv.x * 3.1415 + amt * 2.0) * 0.03 * amt;
      return uv;
    }
    void main() {
      float progress = smoothstep(0.0, 1.0, uProgress);
      float aberration = 0.03 * progress;
      vec2 uv = vUv;
      
      // Warp
      uv = warpUv(uv, progress);
      
      // Chromatic aberration: offset each channel
      float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;
      vec3 color = vec3(r, g, b);
      
      // Add brightness and contrast increase on hover
      float brightness = 1.0 + (0.25 * progress);
      color *= brightness;
      
      // Slightly boost saturation
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 saturated = mix(vec3(luminance), color, 1.0 + (0.3 * progress));
      
      // Apply a cross-fade between previous and current texture if transitioning
      if (uTransition > 0.0) {
        // Get the previous texture color
        vec2 prevUv = warpUv(vUv, progress);
        float prevR = texture2D(uPrevTexture, prevUv + vec2(aberration, 0.0)).r;
        float prevG = texture2D(uPrevTexture, prevUv).g;
        float prevB = texture2D(uPrevTexture, prevUv - vec2(aberration, 0.0)).b;
        vec3 prevColor = vec3(prevR, prevG, prevB);
        
        // Apply the same effects to the previous texture
        prevColor *= brightness;
        float prevLuminance = dot(prevColor, vec3(0.299, 0.587, 0.114));
        vec3 prevSaturated = mix(vec3(prevLuminance), prevColor, 1.0 + (0.3 * progress));
        
        // Mix between the previous and current textures
        saturated = mix(prevSaturated, saturated, uTransition);
      }
      
      gl_FragColor = vec4(saturated, 1.0);
    }
  `,
)

// Register the material for JSX
extend({ DistortMaterial })

// Add TypeScript support for the custom material
declare module '@react-three/fiber' {
  interface ThreeElements {
    distortMaterial: any
  }
}

export default function PlaneWithImage({
  url,
  variant = 'original',
  customAspect,
  size = 1.5,
  forcedHover = false,
}: Props) {
  // Debug logging for URL
  useEffect(() => {
    console.log('PlaneWithImage loading texture:', url)
  }, [url])

  // Use a fallback texture
  const defaultTexture = '/textures/fpo-arturo.jpg'

  // Try to load textures with error handling
  const [texturePath, setTexturePath] = useState(url)
  const [textureError, setTextureError] = useState(false)

  // Handle texture loading errors
  useEffect(() => {
    try {
      if (url !== texturePath && !textureError) {
        setTexturePath(url)
      }
    } catch (error) {
      console.error('Error setting texture path:', error)
    }
  }, [url, texturePath, textureError])

  // Load texture - drei's useTexture doesn't have native error handling,
  // so we'll try to catch with window error event
  const texture = useTexture(texturePath)

  // Add global error handler for texture loading
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is related to texture loading
      if (
        event.message.includes('texture') ||
        event.message.includes('image') ||
        event.filename?.includes(texturePath)
      ) {
        console.error('Error loading texture:', texturePath)
        if (texturePath !== defaultTexture) {
          console.log('Falling back to default texture')
          setTextureError(true)
          setTexturePath(defaultTexture)
        }
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [texturePath, defaultTexture])

  const materialRef = useRef<any>(null)
  const [isHovered, setIsHovered] = useState(false)
  const progress = useRef(0)
  const shadowRef = useRef<THREE.Mesh>(null)
  const shadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null)

  // Keep track of the previous texture for smooth transitions
  const [prevTexture, setPrevTexture] = useState<THREE.Texture | null>(null)
  const [transition, setTransition] = useState(1) // 1 = fully showing current texture

  // When the URL changes, start a transition
  useEffect(() => {
    if (materialRef.current && materialRef.current.uTexture) {
      // Save the current texture as the previous texture
      setPrevTexture(materialRef.current.uTexture)
      // Reset transition to start fading
      setTransition(0)
    }
  }, [texturePath])

  // Handle updating the texture
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uTexture = texture
    }
  }, [texture])

  // Update hover state when forcedHover prop changes
  useEffect(() => {
    if (forcedHover !== isHovered) {
      setIsHovered(forcedHover)
    }
  }, [forcedHover, isHovered])

  // Calculate dimensions based on aspect ratio
  const aspectRatios = {
    original: 1064 / 625,
    wide: 16 / 9.5,
    portrait: 3 / 4,
  }

  const aspect = customAspect ?? aspectRatios[variant]
  const isPortrait = aspect < 1
  const width = isPortrait ? size * aspect : size
  const height = isPortrait ? size : size / aspect

  // Animate hover effect and handle texture transitions
  useFrame((_, delta) => {
    const target = isHovered || forcedHover ? 1 : 0
    const easingSpeed = 8
    progress.current += (target - progress.current) * Math.min(1, delta * easingSpeed)

    if (materialRef.current) {
      materialRef.current.uProgress = progress.current

      // Update transition progress
      if (transition < 1) {
        setTransition(Math.min(1, transition + delta * 3)) // Smooth transition over ~0.33 seconds
      }

      // Update transition and textures in shader
      materialRef.current.uTransition = transition
      if (prevTexture) {
        materialRef.current.uPrevTexture = prevTexture
      }
    }

    // Animate shadow and card position on hover
    if (shadowRef.current && shadowMaterialRef.current) {
      // Slightly elevate the card and make shadow stronger on hover
      shadowRef.current.scale.set(1 + progress.current * 0.05, 1 + progress.current * 0.05, 1)
      shadowRef.current.position.z = -0.01 - progress.current * 0.01
      // Update shadow opacity
      shadowMaterialRef.current.opacity = 0.2 + progress.current * 0.1
    }
  })

  return (
    <group>
      {/* Subtle drop shadow plane slightly behind the card */}
      <mesh ref={shadowRef} position={[0, 0, -0.01]} rotation={[0, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[width * 1.05, height * 1.05]} />
        <meshBasicMaterial
          ref={shadowMaterialRef}
          color="#000000"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Card with image texture */}
      <mesh
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <distortMaterial
          ref={materialRef}
          uTexture={texture}
          uPrevTexture={texture} // Initialize with the same texture
          uProgress={0}
          uTransition={1} // Start fully transitioned
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

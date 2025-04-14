'use client'

import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

/**
 * Fragment shader code for image cropping with brightness adjustment
 *
 * This shader implements:
 * 1. Aspect ratio-preserving image display (cover/contain modes)
 * 2. Brightness adjustment with clamping
 * 3. Proper image cropping with discard for transparent areas
 */
const fragmentShader = `
  uniform sampler2D map;
  uniform float imageAspect;    // The image's aspect ratio adjusted for container
  uniform float coverMode;      // 0: cover (fill and crop), 1: contain (fit whole image)
  uniform float brightness;     // Brightness multiplier
  varying vec2 vUv;            // UV coordinates from vertex shader
  
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
`

/**
 * Simple vertex shader that passes UV coordinates to the fragment shader
 */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Custom shader material for properly displaying images with aspect ratio handling
 *
 * Uniforms:
 * - map: The image texture
 * - imageAspect: Image aspect ratio adjusted for container
 * - coverMode: 0 for "cover" (fill and crop), 1 for "contain" (show whole image)
 * - brightness: Brightness multiplier for the image
 */
export const ImageCropMaterial = shaderMaterial(
  {
    map: null,
    imageAspect: 1.0,
    coverMode: 0, // 0: cover, 1: contain
    brightness: 1.5, // Increased brightness adjustment for better visibility
  },
  vertexShader,
  fragmentShader,
)

// Register the material with the @react-three/fiber ecosystem
extend({ ImageCropMaterial })

// Add TypeScript type definitions
declare module '@react-three/fiber' {
  interface ThreeElements {
    imageCropMaterial: {
      map: THREE.Texture | null
      imageAspect: number
      coverMode: number
      brightness: number
    }
  }
}

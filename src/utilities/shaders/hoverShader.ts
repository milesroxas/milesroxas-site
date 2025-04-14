'use client'

import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

/**
 * Vertex shader that passes UV coordinates and time uniform to fragment shader
 */
const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Fragment shader for hover effects that can be composited with other materials
 */
const fragmentShader = `
  uniform float time;
  uniform float hoverStrength;
  uniform sampler2D baseTexture;
  uniform vec3 hoverColor;
  varying vec2 vUv;

  void main() {
    // Get the base texture color
    vec4 texColor = texture2D(baseTexture, vUv);
    
    // Create a subtle wave effect on hover
    float wave = sin(vUv.y * 10.0 + time * 2.0) * 0.01 * hoverStrength;
    vec2 uvOffset = vec2(wave, 0.0);
    vec4 offsetColor = texture2D(baseTexture, vUv + uvOffset);
    
    // Mix between regular and offset color based on hover strength
    vec4 mixedColor = mix(texColor, offsetColor, hoverStrength * 0.5);
    
    // Apply color tint on hover
    vec3 tintedColor = mix(mixedColor.rgb, hoverColor, hoverStrength * 0.2);
    
    // Output final color
    gl_FragColor = vec4(tintedColor, texColor.a);
  }
`

/**
 * Custom shader material for hover effects
 *
 * This material can be composed with other materials by providing
 * the baseTexture uniform.
 */
export const HoverShaderMaterial = shaderMaterial(
  {
    time: 0,
    hoverStrength: 0,
    baseTexture: null,
    hoverColor: new THREE.Color(1.2, 1.2, 1.2), // Slightly brighter white for highlight
  },
  vertexShader,
  fragmentShader,
)

// Register the material with @react-three/fiber
extend({ HoverShaderMaterial })

// Add TypeScript type definitions
declare module '@react-three/fiber' {
  interface ThreeElements {
    hoverShaderMaterial: {
      time: number
      hoverStrength: number
      baseTexture: THREE.Texture | null
      hoverColor: THREE.Color
    }
  }
}

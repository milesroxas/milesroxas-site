'use client'

import * as THREE from 'three'

// Simple texture cache to avoid reloading the same textures
const textureCache = new Map<string, THREE.Texture>()

/**
 * Preloads a texture and returns a promise that resolves when the texture is loaded
 * @param url - URL of the texture to preload
 * @returns Promise that resolves with the loaded texture
 */
export const preloadTexture = (url: string): Promise<THREE.Texture> => {
  // Return from cache if already loaded
  if (textureCache.has(url)) {
    return Promise.resolve(textureCache.get(url)!)
  }

  return new Promise((resolve, reject) => {
    // Configure texture loader
    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = 'anonymous'

    // Load texture
    textureLoader.load(
      url,
      (texture) => {
        // Optimize texture settings
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.needsUpdate = true

        // Cache the texture
        textureCache.set(url, texture)
        resolve(texture)
      },
      // Progress callback (currently unused)
      undefined,
      // Error callback
      (error) => {
        console.error('Error loading texture:', error)
        reject(error)
      },
    )
  })
}

/**
 * Preloads multiple textures at once
 * @param urls - Array of texture URLs to preload
 * @returns Promise that resolves when all textures are loaded
 */
export const preloadTextures = (urls: string[]): Promise<THREE.Texture[]> => {
  return Promise.all(urls.map((url) => preloadTexture(url)))
}

/**
 * Gets a texture from the cache or null if not found
 * @param url - URL of the texture to get
 * @returns The cached texture or null
 */
export const getCachedTexture = (url: string): THREE.Texture | null => {
  return textureCache.get(url) || null
}

/**
 * Clears the texture cache
 */
export const clearTextureCache = (): void => {
  textureCache.clear()
}

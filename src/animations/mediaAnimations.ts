import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface MediaAnimationOptions {
  enableParallax?: boolean
  enableScale?: boolean
  enableBlur?: boolean
  animationStyle?: 'subtle' | 'standard' | 'bold'
}

/**
 * Creates a subtle parallax effect on media elements
 */
export const createMediaParallax = (element: HTMLElement, speed: number = 0.5) => {
  return gsap.to(element, {
    y: () => element.offsetHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      invalidateOnRefresh: true,
    },
  })
}

/**
 * Creates a scale effect on media as it enters viewport
 */
export const createMediaScaleIn = (
  element: HTMLElement,
  options: { from?: number; to?: number; duration?: number } = {},
) => {
  const { from = 0.95, to = 1, duration = 0.8 } = options

  return gsap.fromTo(
    element,
    {
      scale: from,
      opacity: 0,
    },
    {
      scale: to,
      opacity: 1,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none none',
      },
    },
  )
}

/**
 * Creates a blur-to-focus effect as media enters viewport
 */
export const createMediaBlurIn = (element: HTMLElement, duration: number = 0.6) => {
  return gsap.fromTo(
    element,
    {
      filter: 'blur(10px)',
      opacity: 0,
    },
    {
      filter: 'blur(0px)',
      opacity: 1,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    },
  )
}

/**
 * Combined animation with multiple effects
 */
export const createEnhancedMediaAnimation = (
  element: HTMLElement,
  options: MediaAnimationOptions = {},
) => {
  const { animationStyle = 'subtle', enableParallax = false } = options

  const animations: gsap.core.Tween[] = []

  // Base fade-in with scale
  const scaleFactor = animationStyle === 'bold' ? 0.9 : animationStyle === 'standard' ? 0.95 : 0.98
  const duration = animationStyle === 'bold' ? 1 : animationStyle === 'standard' ? 0.8 : 0.6

  const baseAnimation = gsap.fromTo(
    element,
    {
      scale: scaleFactor,
      opacity: 0,
      y: 30,
    },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none none',
      },
    },
  )

  animations.push(baseAnimation)

  // Optional parallax effect
  if (enableParallax) {
    const parallaxSpeed = animationStyle === 'bold' ? 0.2 : 0.1
    const parallax = createMediaParallax(element, parallaxSpeed)
    animations.push(parallax)
  }

  return animations
}

/**
 * Cleanup function for all media animations
 */
export const killMediaAnimations = (animations: gsap.core.Tween[]) => {
  for (const animation of animations) {
    animation.kill()
  }
  for (const trigger of ScrollTrigger.getAll()) {
    trigger.kill()
  }
}

/**
 * Centralized media optimization configuration
 * Adjust these values to fine-tune loading behavior across the site
 */

export const MEDIA_OPTIMIZATION_CONFIG = {
  /**
   * Number of media blocks to load with priority (eager loading)
   * Rest will be lazy loaded
   */
  PRIORITY_THRESHOLD: 2,

  /**
   * File size threshold (in bytes) to consider a file "large"
   * Large files get extra optimization treatment
   */
  LARGE_FILE_THRESHOLD: 2 * 1024 * 1024, // 2MB

  /**
   * Intersection observer margin for lazy loading
   * Start loading media when it's this far from viewport
   */
  LAZY_LOAD_MARGIN: '100px',

  /**
   * Delay before ScrollTrigger refresh after media loads
   * Helps batch multiple refreshes for better performance
   */
  SCROLL_TRIGGER_REFRESH_DELAY: 150,

  /**
   * Maximum number of media items to preload
   */
  MAX_PRELOAD_COUNT: 2,

  /**
   * Animation configuration for media entrance
   */
  ANIMATION: {
    DURATION: 0.6,
    EASE: 'power2.out',
    SCALE_FROM: 1.02,
    BLUR_FROM: 8,
  },

  /**
   * Video optimization settings
   */
  VIDEO: {
    PRELOAD_PRIORITY: 'auto' as const,
    PRELOAD_LAZY: 'metadata' as const,
    PRELOAD_NONE: 'none' as const,
  },

  /**
   * Enable/disable features
   */
  FEATURES: {
    USE_INTERSECTION_OBSERVER: true,
    USE_SCROLL_COORDINATION: true,
    USE_DEVICE_DETECTION: true,
    RESPECT_DATA_SAVER: true,
    USE_BLUR_PLACEHOLDER: true,
    AUTO_REFRESH_SCROLL_TRIGGER: true,
  },
} as const

export type MediaOptimizationConfig = typeof MEDIA_OPTIMIZATION_CONFIG

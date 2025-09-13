import { registerGSAPPlugins, gsap } from './plugins'

// Centralized GSAP setup
registerGSAPPlugins()

// Example: configure global defaults here if needed
// gsap.defaults({ ease: 'power2.out' })

export { gsap }


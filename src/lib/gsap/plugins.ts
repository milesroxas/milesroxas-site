import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Flip from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

let registered = false

export const registerGSAPPlugins = () => {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP)
  registered = true
}

export { gsap, ScrollTrigger, Flip }


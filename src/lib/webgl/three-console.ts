import { setConsoleFunction } from 'three'

// R3F 9 builds every store on the deprecated THREE.Clock; v10 moves to THREE.Timer.
const R3F_CLOCK = 'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'

setConsoleFunction((type, message, ...params) => {
  if (message === R3F_CLOCK) return
  console[type](message, ...params)
})

'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './cursor.module.css'
import { CursorContext } from '../CursorProvider'
import { useContext } from 'react'

// Main Cursor Component
const Cursor = () => {
  const { variant } = useContext(CursorContext)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Store the target and current position for damping
  const mousePosition = useRef({ x: 0, y: 0 })
  const cursorPosition = useRef({ x: 0, y: 0 })
  const requestRef = useRef<number | null>(null)

  // Function to update cursor position with damping effect
  const animateCursor = () => {
    // Damping factor: lower = smoother, higher = more responsive
    const damping = 0.1

    // Calculate distance between current and target position
    const dx = mousePosition.current.x - cursorPosition.current.x
    const dy = mousePosition.current.y - cursorPosition.current.y

    // Maximum distance the cursor can lag behind the mouse (in pixels)
    const maxDistance = 15

    // Limit distance if it exceeds the maximum
    const distance = Math.sqrt(dx * dx + dy * dy)
    let limitedDx = dx
    let limitedDy = dy

    if (distance > maxDistance) {
      const scale = maxDistance / distance
      limitedDx = dx * scale
      limitedDy = dy * scale

      // Set cursor position closer to mouse when exceeding max distance
      cursorPosition.current.x = mousePosition.current.x - limitedDx
      cursorPosition.current.y = mousePosition.current.y - limitedDy
    } else {
      // Regular damping when within max distance
      cursorPosition.current.x += dx * damping
      cursorPosition.current.y += dy * damping
    }

    // Apply the position to cursor elements
    if (cursorOuterRef.current) {
      cursorOuterRef.current.style.transform = `translate(${cursorPosition.current.x}px, ${cursorPosition.current.y}px) translate(-50%, -50%)`
    }

    if (cursorInnerRef.current) {
      // Inner cursor follows exactly with no damping
      cursorInnerRef.current.style.transform = `translate(${mousePosition.current.x}px, ${mousePosition.current.y}px) translate(-50%, -50%)`
    }

    requestRef.current = requestAnimationFrame(animateCursor)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)

      // Update target position
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    const onMouseEnter = () => {
      setIsVisible(true)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    // Start animation loop
    requestRef.current = requestAnimationFrame(animateCursor)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)

      // Cancel animation frame on cleanup
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isVisible])

  // Apply different styles based on variant
  useEffect(() => {
    // Apply different animations based on the variant
    if (cursorOuterRef.current) {
      switch (variant) {
        case 'default':
          gsap.to(cursorOuterRef.current, {
            duration: 0.1,
            backgroundColor: 'transparent',
            border: '1px solid white',
            scale: 1,
          })
          break
        case 'text':
          gsap.to(cursorOuterRef.current, {
            duration: 0.1,
            backgroundColor: 'transparent',
            border: '1px solid white',
            scale: 1.5,
          })
          break
        case 'button':
          gsap.to(cursorOuterRef.current, {
            duration: 0.1,
            backgroundColor: 'white',
            border: 'none',
            scale: 1.4,
          })
          break
        case 'link':
          gsap.to(cursorOuterRef.current, {
            duration: 0.1,
            backgroundColor: 'white',
            border: 'none',
            scale: 1.2,
          })
          break
        case 'media':
          gsap.to(cursorOuterRef.current, {
            duration: 0.1,
            backgroundColor: 'transparent',
            border: '1px solid white',
            scale: 2,
          })
          break
      }
    }
  }, [variant])

  return (
    <>
      <div
        ref={cursorOuterRef}
        className={styles.cursorOuter}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        ref={cursorInnerRef}
        className={styles.cursorInner}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  )
}

export default Cursor

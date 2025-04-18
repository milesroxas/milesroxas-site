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

  // Cache dimensions to avoid layout thrashing
  const dimensions = useRef({
    outerWidth: 30,
    outerHeight: 30,
    innerWidth: 12,
    innerHeight: 12,
  })

  // Function to update cursor position with damping effect
  const animateCursor = () => {
    // Damping factor: lower = smoother, higher = more responsive
    const damping = 0.12

    // Calculate distance between current and target position
    const dx = mousePosition.current.x - cursorPosition.current.x
    const dy = mousePosition.current.y - cursorPosition.current.y

    // Maximum distance the cursor can lag behind the mouse (in pixels)
    const maxDistance = 30

    // Limit distance if it exceeds the maximum
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Handle cursor movement differently based on distance from mouse
    if (distance > maxDistance) {
      // When too far, move more directly toward mouse position
      const scale = maxDistance / distance
      cursorPosition.current.x = mousePosition.current.x - dx * scale
      cursorPosition.current.y = mousePosition.current.y - dy * scale
    } else {
      // Regular damping when within max distance - ensure movement even for small distances
      // Small threshold to ensure we always complete the animation
      const threshold = 0.01
      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        cursorPosition.current.x += dx * damping
        cursorPosition.current.y += dy * damping
      } else {
        // When extremely close, snap to final position to prevent sticking
        cursorPosition.current.x = mousePosition.current.x
        cursorPosition.current.y = mousePosition.current.y
      }
    }

    // Apply the position to cursor elements with simple translate
    if (cursorOuterRef.current) {
      // Center cursor by offsetting half its dimensions
      cursorOuterRef.current.style.transform = `translate(${cursorPosition.current.x - dimensions.current.outerWidth / 2}px, ${cursorPosition.current.y - dimensions.current.outerHeight / 2}px)`
    }

    if (cursorInnerRef.current) {
      // Inner cursor follows exactly with no damping
      cursorInnerRef.current.style.transform = `translate(${mousePosition.current.x - dimensions.current.innerWidth / 2}px, ${mousePosition.current.y - dimensions.current.innerHeight / 2}px)`
    }

    requestRef.current = requestAnimationFrame(animateCursor)
  }

  // Initialize cursor position
  useEffect(() => {
    // Set initial positions to prevent jumps on first render
    if (typeof window !== 'undefined') {
      mousePosition.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      cursorPosition.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    // Initialize dimensions once elements are rendered
    if (cursorOuterRef.current && cursorInnerRef.current) {
      dimensions.current = {
        outerWidth: cursorOuterRef.current.offsetWidth,
        outerHeight: cursorOuterRef.current.offsetHeight,
        innerWidth: cursorInnerRef.current.offsetWidth,
        innerHeight: cursorInnerRef.current.offsetHeight,
      }
    }
  }, [])

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

  // Update dimensions on variant change since the cursor might resize
  useEffect(() => {
    // Small delay to let GSAP animations complete
    const updateDimensions = () => {
      if (cursorOuterRef.current && cursorInnerRef.current) {
        dimensions.current = {
          outerWidth: cursorOuterRef.current.offsetWidth,
          outerHeight: cursorOuterRef.current.offsetHeight,
          innerWidth: cursorInnerRef.current.offsetWidth,
          innerHeight: cursorInnerRef.current.offsetHeight,
        }
      }
    }

    const timeoutId = setTimeout(updateDimensions, 150)
    return () => clearTimeout(timeoutId)
  }, [variant])

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

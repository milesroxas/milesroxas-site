'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import styles from './cursor.module.css'
import { CursorContext } from './CursorProvider'
import { useContext } from 'react'

// Register the plugin
gsap.registerPlugin(useGSAP)

const Cursor = () => {
  const { variant } = useContext(CursorContext)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const cursorTextRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Mouse position ref for event handlers
  const mousePos = useRef({ x: 0, y: 0 })

  // Refs for quickTo functions
  const outerQuickToRef = useRef<{
    x: gsap.QuickToFunc
    y: gsap.QuickToFunc
  } | null>(null)

  const innerQuickToRef = useRef<{
    x: gsap.QuickToFunc
    y: gsap.QuickToFunc
  } | null>(null)

  const textQuickToRef = useRef<{
    x: gsap.QuickToFunc
    y: gsap.QuickToFunc
  } | null>(null)

  const isMobile =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

  // Initialize GSAP animations
  useGSAP(() => {
    if (!cursorOuterRef.current || !cursorInnerRef.current || !cursorTextRef.current) return

    // Set initial properties
    gsap.set(cursorOuterRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: mousePos.current.x,
      y: mousePos.current.y,
    })

    gsap.set(cursorInnerRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: mousePos.current.x,
      y: mousePos.current.y,
    })

    gsap.set(cursorTextRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: mousePos.current.x,
      y: mousePos.current.y,
    })

    // Create quickTo functions for smooth cursor movement
    outerQuickToRef.current = {
      x: gsap.quickTo(cursorOuterRef.current, 'x', {
        duration: 0.5,
        ease: 'power3.out',
      }),
      y: gsap.quickTo(cursorOuterRef.current, 'y', {
        duration: 0.5,
        ease: 'power3.out',
      }),
    }

    innerQuickToRef.current = {
      x: gsap.quickTo(cursorInnerRef.current, 'x', {
        duration: 0.1,
        ease: 'power2.out',
      }),
      y: gsap.quickTo(cursorInnerRef.current, 'y', {
        duration: 0.1,
        ease: 'power2.out',
      }),
    }

    textQuickToRef.current = {
      x: gsap.quickTo(cursorTextRef.current, 'x', {
        duration: 0.5,
        ease: 'power3.out',
      }),
      y: gsap.quickTo(cursorTextRef.current, 'y', {
        duration: 0.5,
        ease: 'power3.out',
      }),
    }
  }, [])

  // Handle variant changes
  useGSAP(
    () => {
      if (!cursorOuterRef.current || !cursorTextRef.current || !isVisible) return

      // Define variant styles
      const variantStyles = {
        default: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 0.8,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        },
        text: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 0.8,
          scale: 1.5,
          duration: 0.2,
          ease: 'power2.out',
        },
        button: {
          backgroundColor: 'white',
          borderColor: 'transparent',
          borderWidth: 0.8,
          scale: 1.4,
          duration: 0.2,
          ease: 'power2.out',
        },
        link: {
          backgroundColor: 'white',
          borderColor: 'transparent',
          borderWidth: 0.8,
          scale: 1.2,
          duration: 0.2,
          ease: 'power2.out',
        },
        media: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 0.8,
          scale: 2,
          duration: 0.2,
          ease: 'power2.out',
        },
        slider: {
          backgroundColor: 'transparent',
          borderColor: '#09C8BD',
          borderWidth: 0.8,
          scale: 1.8,
          duration: 0.2,
          ease: 'power2.out',
        },
      }

      const style = variantStyles[variant] || variantStyles.default

      // Animate only the visual properties, not position
      gsap.to(cursorOuterRef.current, {
        ...style,
        overwrite: 'auto', // Prevent animation conflicts
      })

      // Handle text visibility and content for slider variant
      if (variant === 'slider') {
        gsap.to(cursorTextRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        gsap.to(cursorInnerRef.current, {
          scale: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      } else {
        gsap.to(cursorTextRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: 'power2.in',
        })
        gsap.to(cursorInnerRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    },
    { dependencies: [variant, isVisible] },
  )

  // Mouse event handlers
  useEffect(() => {
    if (isMobile) return

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)

      mousePos.current = { x: e.clientX, y: e.clientY }

      // Update cursor positions using quickTo
      if (outerQuickToRef.current && innerQuickToRef.current && textQuickToRef.current) {
        outerQuickToRef.current.x(e.clientX)
        outerQuickToRef.current.y(e.clientY)
        innerQuickToRef.current.x(e.clientX)
        innerQuickToRef.current.y(e.clientY)
        textQuickToRef.current.x(e.clientX)
        textQuickToRef.current.y(e.clientY)
      }
    }

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    const onMouseEnter = () => {
      setIsVisible(true)
    }

    // Initialize cursor position
    if (typeof window !== 'undefined') {
      mousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [isVisible, isMobile])

  // Handle visibility
  useGSAP(
    () => {
      if (!cursorOuterRef.current || !cursorInnerRef.current || !cursorTextRef.current) return

      gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
        opacity: isVisible ? 1 : 0,
        duration: 0.3,
        ease: 'power2.inOut',
      })

      // Text element only visible when slider variant is active
      if (variant === 'slider' && isVisible) {
        gsap.to(cursorTextRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.inOut',
        })
      } else {
        gsap.to(cursorTextRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.inOut',
        })
      }
    },
    { dependencies: [isVisible, variant] },
  )

  if (isMobile) return null

  return (
    <>
      <div
        ref={cursorOuterRef}
        className={styles.cursorOuter}
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
          border: '1px solid white',
        }}
      />
      <div
        ref={cursorInnerRef}
        className={styles.cursorInner}
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      />
      <div
        ref={cursorTextRef}
        className={styles.cursorText}
        style={{
          visibility: isVisible && variant === 'slider' ? 'visible' : 'hidden',
          opacity: 0,
        }}
      >
        Drag
      </div>
    </>
  )
}

export default Cursor

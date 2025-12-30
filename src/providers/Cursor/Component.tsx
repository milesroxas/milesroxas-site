'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useContext, useEffect, useRef, useState } from 'react'
import { CursorContext } from './CursorProvider'
import styles from './cursor.module.css'

// Register the plugin
gsap.registerPlugin(useGSAP)

const Cursor = () => {
  const { variant, customText } = useContext(CursorContext)
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

  // Define text content for different variants
  const variantText: Record<string, string> = {
    slider: 'Drag',
  }

  const showText = variant === 'slider'

  const isMobile =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

  // Initialize GSAP animations
  useGSAP(() => {
    if (!cursorOuterRef.current || !cursorInnerRef.current || !cursorTextRef.current) return

    // Set initial properties with proper centering offsets
    gsap.set(cursorOuterRef.current, {
      x: mousePos.current.x - 20, // Half of 40px width
      y: mousePos.current.y - 20, // Half of 40px height
    })

    gsap.set(cursorInnerRef.current, {
      x: mousePos.current.x - 6, // Half of 12px width
      y: mousePos.current.y - 6, // Half of 12px height
    })

    gsap.set(cursorTextRef.current, {
      x: mousePos.current.x,
      y: mousePos.current.y,
      xPercent: -50, // Center horizontally
      yPercent: -50, // Center vertically
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
          borderWidth: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        },
        text: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 1,
          scale: 1.5,
          duration: 0.2,
          ease: 'power2.out',
        },
        button: {
          borderWidth: 0.8,
          scale: 1.5,
          borderColor: '#EA580C',
          duration: 0.2,
          ease: 'power2.out',
        },
        link: {
          backgroundColor: 'white',
          borderColor: 'transparent',
          borderWidth: 0,
          scale: 1.2,
          duration: 0.2,
          ease: 'power2.out',
        },
        media: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 1,
          scale: 2,
          duration: 0.2,
          ease: 'power2.out',
        },
        slider: {
          backgroundColor: 'transparent',
          borderColor: 'white',
          borderWidth: 1,
          scale: 1.5, // Adjusted for 40px base size
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
      if (!showText) {
        // For variants without text, scale up the inner cursor
        gsap.to(cursorInnerRef.current, {
          scale: variant === 'default' ? 1 : 1.25, // Scale to 2x when hovering (non-default), 1x when not
          opacity: 1,
          backgroundColor: variant === 'default' ? 'white' : 'white',
          visibility: 'visible',
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      // Handle text visibility and content for variants with text
      if (showText) {
        // First animate the inner cursor to shrink and fade out
        gsap.to(cursorInnerRef.current, {
          opacity: 0,
          scale: 0.5, // Reduce size more dramatically
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            // After inner cursor animation completes, show the text
            gsap.to(cursorTextRef.current, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out',
            })
            // Hide the inner cursor after animation
            gsap.set(cursorInnerRef.current, { visibility: 'hidden' })
          },
        })
      } else {
        // Hide text first
        gsap.to(cursorTextRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            // After text is hidden, show the inner cursor
            gsap.to(cursorInnerRef.current, {
              scale: variant === 'default' ? 1 : 1.5, // Keep the same scale logic
              visibility: 'visible',
              duration: 0.2,
              ease: 'power2.out',
            })
          },
        })
      }
    },
    { dependencies: [variant, isVisible, showText] },
  )

  // Mouse event handlers
  useEffect(() => {
    if (isMobile) return

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)

      mousePos.current = { x: e.clientX, y: e.clientY }

      // Update cursor positions using quickTo
      if (outerQuickToRef.current && innerQuickToRef.current && textQuickToRef.current) {
        outerQuickToRef.current.x(e.clientX - 20)
        outerQuickToRef.current.y(e.clientY - 20)
        innerQuickToRef.current.x(e.clientX - 6)
        innerQuickToRef.current.y(e.clientY - 6)

        // Set the text position without any offset, since we're using xPercent/yPercent
        textQuickToRef.current.x(e.clientX)
        textQuickToRef.current.y(e.clientY)

        // Make sure to apply the centering percentages
        gsap.set(cursorTextRef.current, {
          xPercent: -50,
          yPercent: -50,
        })
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

      // Text element only visible when variants with text are active
      if (showText && isVisible) {
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
    { dependencies: [isVisible, variant, showText] },
  )

  if (isMobile) return null

  return (
    <>
      <div
        ref={cursorOuterRef}
        className={`${styles.cursorOuter} ${variant === 'button' ? styles.cursorOuterBlurred : ''}`}
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
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
        className={`${styles.cursorText} ${variant === 'button' ? styles.cursorTextDark : ''}`}
        style={{
          visibility: isVisible && showText ? 'visible' : 'hidden',
          opacity: 0,
        }}
      >
        {customText || variantText[variant] || ''}
      </div>
    </>
  )
}

export default Cursor

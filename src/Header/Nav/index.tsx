'use client'

import gsap from 'gsap'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import type { Header as HeaderType } from '@/payload-types'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const router = useRouter()
  const navItems = data?.navItems || []
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<Array<HTMLDivElement | null>>([])
  // holds the route we'll navigate to once the close animation completes
  const pendingRouteRef = useRef<string | null>(null)

  // step 1: when opening, render into the DOM
  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  // step 2: animate open/close
  useEffect(() => {
    if (!shouldRender || !menuRef.current) return

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    if (isOpen) {
      gsap.set(menuRef.current, { opacity: 0 })
      gsap.set(navItemsRef.current, { opacity: 0, y: 24 })
      tl.to(menuRef.current, { opacity: 1, duration: 0.25 })
      tl.to(navItemsRef.current, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, '-=0.1')
    } else {
      // closing animation
      tl.to(navItemsRef.current, { opacity: 0, y: 24, duration: 0.2, stagger: 0.05 })
      tl.to(
        menuRef.current,
        {
          opacity: 0,
          duration: 0.18,
          onComplete: () => {
            // remove from DOM
            setShouldRender(false)

            // and only then navigate
            if (pendingRouteRef.current) {
              router.push(pendingRouteRef.current)
              pendingRouteRef.current = null
            }
          },
        },
        '-=0.05',
      )
    }

    return () => {
      tl.kill()
    }
  }, [isOpen, shouldRender, router])

  // helper to assign refs to each nav item for staggered animation
  const setNavItemRef = (el: HTMLDivElement | null, idx: number) => {
    navItemsRef.current[idx] = el
  }

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  // onClick handler: store target, then begin close animation
  const handleNavClick = (href: string) => {
    pendingRouteRef.current = href
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="fixed top-6 right-6 z-50 rounded-xs bg-gray-400/60 shadow-xs backdrop-blur-md transition-colors duration-250 ease-in-out hover:bg-accent md:top-16 md:right-16"
      >
        <span className="z-20 flex items-center px-4 py-1 text-sm text-white uppercase tracking-widest">
          Menu
        </span>
      </button>

      {shouldRender && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-50 h-full w-full bg-white"
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          <div className="flex h-full flex-col pt-12 pl-8 md:pl-16">
            <div className="absolute top-6 left-8 md:top-16 md:pl-16">
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('/')
                }}
              >
                <Logo className="h-4 w-auto" />
              </Link>
            </div>
            <div className="absolute top-6 right-6 md:top-16 md:right-16">
              <button
                type="button"
                onClick={closeModal}
                className="fixed top-6 right-6 z-50 rounded-xs bg-gray-800/10 shadow-xs backdrop-blur-sm transition-colors duration-250 ease-in-out hover:bg-accent md:top-16 md:right-16"
                tabIndex={isOpen ? 0 : -1}
              >
                <span className="z-20 flex items-center px-4 py-1 text-sm text-white uppercase tracking-widest">
                  Close
                </span>
              </button>
            </div>

            <nav className="container flex flex-1 flex-col justify-center gap-12 pl-6">
              {navItems.map(({ link }, i) => (
                <div
                  key={`nav-item-${link?.label || ''}-${link?.url || ''}-${i}`}
                  ref={(el) => setNavItemRef(el, i)}
                >
                  <CMSLink
                    {...link}
                    appearance="inline"
                    className="text-4xl text-primary"
                    onClick={handleNavClick}
                  />
                </div>
              ))}

              <div ref={(el) => setNavItemRef(el, navItems.length)}>
                <button
                  type="button"
                  onClick={() => handleNavClick('/search')}
                  className="flex items-center"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <span className="sr-only">Search</span>
                  <SearchIcon className="w-5 text-primary" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

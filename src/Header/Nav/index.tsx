'use client'

import React, { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import { useRouter } from 'next/navigation'

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
  }, [isOpen, shouldRender, navItems.length, router])

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
        onClick={openModal}
        className="fixed top-6 right-6 z-50 mix-blend-difference md:top-16 md:right-16"
      >
        <span className="flex items-center rounded-xs bg-white/20 px-4 py-1 font-medium text-white backdrop-blur-md hover:bg-slate-200/80 hover:text-slate-900 hover:shadow-lg lg:rounded-sm">
          Menu
        </span>
      </button>

      {shouldRender && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[9999] h-full w-full bg-white"
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
                onClick={closeModal}
                className="flex items-center rounded-xs bg-gray-300/40 px-4 py-1 font-medium text-gray-700 backdrop-blur-sm hover:bg-slate-200/80 hover:text-slate-900 hover:shadow-lg lg:rounded-sm"
                tabIndex={isOpen ? 0 : -1}
              >
                Close
              </button>
            </div>

            <nav className="container flex flex-1 flex-col justify-center gap-12 pl-6">
              {navItems.map(({ link }, i) => (
                <div key={i} ref={(el) => setNavItemRef(el, i)}>
                  <CMSLink
                    {...link}
                    appearance="inline"
                    className="text-primary text-4xl"
                    onClick={handleNavClick}
                  />
                </div>
              ))}

              <div ref={(el) => setNavItemRef(el, navItems.length)}>
                <button
                  onClick={() => handleNavClick('/search')}
                  className="flex items-center"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <span className="sr-only">Search</span>
                  <SearchIcon className="text-primary w-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

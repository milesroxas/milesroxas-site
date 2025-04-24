'use client'

import React, { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<Array<HTMLDivElement | null>>([])

  // Show modal in DOM before animating in
  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  // Animate in/out
  useEffect(() => {
    if (!shouldRender) return
    if (!menuRef.current) return

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    if (isOpen) {
      gsap.set(menuRef.current, { opacity: 0 })
      gsap.set(navItemsRef.current, { opacity: 0, y: 24 })
      tl.to(menuRef.current, { opacity: 1, duration: 0.25 })
      tl.to(navItemsRef.current, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, '-=0.1')
    } else {
      tl.to(navItemsRef.current, { opacity: 0, y: 24, duration: 0.2, stagger: 0.05 })
      tl.to(
        menuRef.current,
        {
          opacity: 0,
          duration: 0.18,
          onComplete: () => setShouldRender(false),
        },
        '-=0.05',
      )
    }
    return () => {
      tl.kill()
    }
  }, [isOpen, shouldRender, navItems.length])

  // Callback refs for nav items
  const setNavItemRef = (el: HTMLDivElement | null, index: number) => {
    navItemsRef.current[index] = el
  }

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleNavClick = () => closeModal()

  return (
    <>
      <button onClick={openModal} className="fixed top-16 right-16 z-50">
        <span className="bg-background/40 flex h-auto items-center justify-center rounded-sm px-5 py-1 font-medium tracking-[0.25em] text-slate-800 uppercase backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-slate-200/80 hover:text-slate-900 hover:shadow-lg">
          Menu
        </span>
      </button>

      {shouldRender && (
        <div
          ref={menuRef}
          className="bg-background fixed inset-0 z-60 h-full w-full p-0"
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          <div className="flex h-full flex-col pt-12">
            <div className="mx-auto w-6/12 p-4">
              <Link href="/" onClick={closeModal}>
                <Logo />
              </Link>
            </div>
            <div className="absolute top-16 right-16">
              <button
                className="bg-background/40 flex h-auto items-center justify-center rounded-sm px-5 py-1 font-medium tracking-[0.25em] text-slate-800 uppercase backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-slate-200/80 hover:text-slate-900 hover:shadow-lg"
                onClick={closeModal}
                tabIndex={isOpen ? 0 : -1}
              >
                CLOSE
              </button>
            </div>
            <div className="container flex flex-1 flex-col items-center justify-center">
              <nav className="flex w-full flex-col items-start justify-between gap-12">
                {navItems.map(({ link }, i) => (
                  <div key={i} ref={(el) => setNavItemRef(el, i)} onClick={handleNavClick}>
                    <CMSLink {...link} appearance="inline" className="text-primary text-4xl" />
                  </div>
                ))}
                <div ref={(el) => setNavItemRef(el, navItems.length)} onClick={handleNavClick}>
                  <Link href="/search">
                    <span className="sr-only">Search</span>
                    <SearchIcon className="text-primary w-5" />
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

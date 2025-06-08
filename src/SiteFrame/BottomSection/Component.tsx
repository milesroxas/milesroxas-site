'use client'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'

export default function BottomSection() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // Function to update the current time in New York
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      }

      const nyTime = new Intl.DateTimeFormat('en-US', options).format(new Date())
      setCurrentTime(nyTime)
    }

    // Update time immediately and then every minute
    updateTime()
    const interval = setInterval(updateTime, 60000)

    // Handle viewport height for mobile browsers
    const setViewportHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    }

    // Set initial viewport height
    setViewportHeight()

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return (
    <div className="container flex w-full items-center justify-between align-middle">
      <div className="w-30 text-left font-mono text-xs text-slate-700 uppercase md:text-sm">
        {currentTime}
      </div>
      <Link href="/" className="pointer-events-auto z-50">
        <div className="w-40 md:w-30 lg:w-60">
          <Logo className="dark:invert-0" />
        </div>
      </Link>
      <Link href="/contact" className="pointer-events-auto z-50">
        <div className="w-30 text-right font-mono text-xs tracking-wider text-slate-700 uppercase">
          Contact
        </div>
      </Link>
    </div>
  )
}

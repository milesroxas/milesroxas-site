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

    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex w-full items-center justify-between px-2 align-middle">
      <div className="w-30 text-left font-mono text-xs text-slate-700 uppercase md:text-sm">
        {currentTime}
      </div>
      <Link href="/">
        <div className="w-40 md:w-30 lg:!w-40">
          <Logo className="dark:invert-0" />
        </div>
      </Link>
      <div className="w-30 text-right font-mono text-xs tracking-wider text-slate-700 uppercase">
        Contact
      </div>
    </div>
  )
}

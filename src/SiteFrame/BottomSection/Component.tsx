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
      setCurrentTime(nyTime + ' EST')
    }

    // Update time immediately and then every minute
    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])
  return (
    <div className="fixed right-0 bottom-0 z-50 w-full">
      <div className="flex h-[40px] items-center justify-between px-[40px] align-middle">
        <div className="w-20 font-mono text-sm text-slate-700 uppercase">{currentTime}</div>
        <Link href="/">
          <div className="w-40 md:w-50">
            <Logo className="dark:invert-0" />
          </div>
        </Link>
        <div className="w-20 text-right font-mono text-sm text-slate-700 uppercase">Contact</div>
      </div>
    </div>
  )
}

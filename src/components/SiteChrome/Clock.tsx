'use client'

import { useEffect, useState } from 'react'

const TIME_ZONE = 'America/New_York'

const format = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
})

/**
 * The time in New York, read on the client only (a static page would serve
 * the time it was built at). Ticks on the minute boundary rather than every
 * 60s from mount, so it never lags a real clock by up to a minute.
 */
function useNewYorkTime(): { label: string; iso: string } | null {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const date = new Date()
      setNow(date)
      timer = window.setTimeout(tick, 60_000 - (date.getTime() % 60_000))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [])

  return now ? { label: format.format(now), iso: now.toISOString() } : null
}

/**
 * Miles's local time. The label is quiet, the time is the value, set in
 * mono so the digits hold still as the minutes change.
 */
export function Clock() {
  const time = useNewYorkTime()
  return (
    <p className="flex items-center gap-1.5 text-xs/4 md:gap-2 md:text-[0.8125rem]/[1.125rem]">
      <span className="text-(--chrome-ink-quiet)">New York</span>
      {/* Width held for "12:00 PM" so the label never shifts when the time
          lands; set flush right so the row keeps its edge. */}
      <time
        className="inline-block min-w-[8ch] text-right font-mono text-(--chrome-ink) tabular-nums"
        dateTime={time?.iso}
      >
        {time?.label}
      </time>
    </p>
  )
}

'use client'

import { useEffect, useState } from 'react'

const TIME_ZONE = 'America/New_York'

const format = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
})

/** The zone's short name for that moment: EST in winter, EDT in summer. */
const zoneFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  timeZoneName: 'short',
})

const zoneName = (date: Date) =>
  zoneFormat.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? ''

/**
 * The time in New York, read on the client only (a static page would serve
 * the time it was built at). Ticks on the minute boundary rather than every
 * 60s from mount, so it never lags a real clock by up to a minute.
 */
function useNewYorkTime(): { label: string; zone: string; iso: string } | null {
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

  return now ? { label: format.format(now), zone: zoneName(now), iso: now.toISOString() } : null
}

/**
 * Miles's local time. The label is quiet, the time is the value, set in
 * mono so the digits hold still as the minutes change. On a phone the
 * label is left to screen readers and the zone follows the time instead, so
 * the centred wordmark keeps a gap beside it.
 */
export function Clock() {
  const time = useNewYorkTime()
  return (
    <p className="flex items-center gap-1.5 text-xs/4 md:text-[0.8125rem]/[1.125rem]">
      <span className="text-(--chrome-ink-quiet) max-md:sr-only">Brooklyn, NY</span>
      {/* Sized to the time itself so the label sits a fixed gap from the
          digits; the row is anchored right, so only the label moves, once,
          when the hour gains a digit. */}
      <time className="font-mono text-(--chrome-ink) tabular-nums" dateTime={time?.iso}>
        {time?.label}
      </time>
      {time && <span className="font-mono text-(--chrome-ink-quiet) md:hidden">{time.zone}</span>}
    </p>
  )
}

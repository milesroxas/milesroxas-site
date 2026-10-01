'use client'

import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { useRef } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { useChromeStore } from '@/stores/chromeStore'
import { Clock } from './Clock'
import { ThemeToggle } from './ThemeToggle'
import { useBandGround } from './use-band-ground'

/**
 * The top of the chrome: the wordmark home, and Miles's local time. No bar
 * and no fill; the words float over the page.
 *
 * On a page that names itself (`ChromeTitle`), the centre shows where the
 * reader is once the page's heading has scrolled away: the tab, then the
 * title. Wide screens only; a phone has no room between the two ends.
 *
 * The theme toggle sits with the clock rather than in the dock: both are the
 * bar's quiet register, and the dock stays navigation only.
 */
export function TopBar({ section }: { section: string | null }) {
  const ref = useRef<HTMLElement>(null)
  const ground = useBandGround(ref)
  const title = useChromeStore((state) => state.title)

  return (
    <header
      className="chrome-top pointer-events-none fixed inset-x-0 top-0 z-40 flex h-(--chrome-top) items-center justify-between px-5 text-(--chrome-ink) md:px-8"
      data-chrome=""
      data-chrome-top=""
      data-theme={ground}
      ref={ref}
    >
      <Link
        aria-label="Miles Roxas, home"
        className="chrome-focus pointer-events-auto -m-2 rounded-md p-2"
        href="/"
      >
        <Logo className="h-auto w-29 md:w-40" color="currentColor" />
      </Link>

      {title && section && (
        <p
          aria-hidden={!title.shown}
          className="chrome-title absolute inset-x-0 mx-auto hidden w-fit items-center gap-1.5 font-medium text-sm/5 md:flex"
          data-shown={title.shown}
        >
          <span className="text-(--chrome-ink-muted)">{section}</span>
          <IconChevronRight aria-hidden className="size-3.5 text-(--chrome-ink-quiet)" />
          <span className="max-w-[40vw] truncate font-semibold">{title.text}</span>
        </p>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <Clock />
      </div>
    </header>
  )
}

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
 * and no fill; the words float over the page. The wordmark sits at the left
 * on a phone and is centred from md.
 *
 * On a page that names itself (`ChromeTitle`), the left shows where the
 * reader is once the page's heading has scrolled away: the tab, then the
 * title. Wide screens only; a phone has no room beside the wordmark.
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
      className="chrome-top pointer-events-none fixed inset-x-0 top-0 z-40 flex h-(--chrome-top) items-center justify-between text-(--chrome-ink)"
      data-chrome=""
      data-chrome-top=""
      data-theme={ground}
      ref={ref}
    >
      <div className="hidden min-w-0 flex-1 md:block">
        {title && section && (
          <p
            aria-hidden={!title.shown}
            className="chrome-title hidden min-w-0 max-w-[calc(50vw-8.5rem)] items-center gap-1.5 overflow-hidden font-medium text-sm/5 md:flex"
            data-shown={title.shown}
          >
            <span className="shrink-0 text-(--chrome-ink-muted)">{section}</span>
            <IconChevronRight aria-hidden className="size-3.5 shrink-0 text-(--chrome-ink-quiet)" />
            <span className="truncate font-semibold">{title.text}</span>
          </p>
        )}
      </div>

      <Link
        aria-label="Miles Roxas, home"
        className="chrome-focus md:-translate-1/2 pointer-events-auto z-10 -ml-2 flex h-11 items-center rounded-md px-2 md:absolute md:top-1/2 md:left-1/2 md:ml-0 md:block md:h-auto md:p-2"
        href="/"
      >
        <Logo className="h-auto w-32 md:w-40" color="currentColor" />
      </Link>

      <div className="flex shrink-0 items-center gap-4 md:gap-5">
        <Clock />
        <ThemeToggle />
      </div>
    </header>
  )
}

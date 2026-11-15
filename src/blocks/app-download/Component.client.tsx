'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { cn } from '@/utilities/ui'
import { BrandMark } from './marks'

export type PlatformId = 'mac' | 'windows' | 'linux'
type Arch = 'arm64' | 'x64'
type Visitor = PlatformId | 'mobile' | 'unknown'

export type Build = { key: Arch; label: string; url: string; ext: string; size: string | null }
export type Platform = { id: PlatformId; name: string; note: string | null; builds: Build[] }

const metaClassName = 'font-mono text-xs/4 tracking-wider uppercase'

// The platform never changes during a visit; the server snapshot keeps the cached HTML neutral.
const subscribe = () => () => {}
const serverVisitor = (): Visitor => 'unknown'
function readVisitor(): Visitor {
  const ua = navigator.userAgent
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
  const platform = uaData?.platform || navigator.platform || ''
  // iPadOS reports a Mac platform; touch points tell them apart.
  if (
    /iPhone|iPad|iPod|Android/i.test(ua) ||
    (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)
  )
    return 'mobile'
  if (/Mac/i.test(platform)) return 'mac'
  if (/Win/i.test(platform)) return 'windows'
  if (/Linux|X11|CrOS/i.test(platform)) return 'linux'
  return 'unknown'
}

async function detectMacArch(): Promise<Arch | null> {
  try {
    const uaData = (
      navigator as Navigator & {
        userAgentData?: {
          getHighEntropyValues?: (h: string[]) => Promise<{ architecture?: string }>
        }
      }
    ).userAgentData
    if (uaData?.getHighEntropyValues) {
      const { architecture } = await uaData.getHighEntropyValues(['architecture'])
      if (architecture === 'arm') return 'arm64'
      if (architecture === 'x86') return 'x64'
    }
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl?.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    if (/Intel|AMD|Radeon/i.test(renderer)) return 'x64'
  } catch {}
  return null
}

const Pict = ({ d, className }: { d: string; className?: string }) => (
  <svg
    aria-hidden="true"
    className={cn('size-5 shrink-0', className)}
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path d={d} />
  </svg>
)
const DOWNLOAD = 'M12 4v11M7 10l5 5 5-5M5 20h14'
const CHECK = 'M5 12.5 10 17 19 7'
const OUT = 'M8 16 17 7M9 7h8v8'

/** The download arrow swaps to a check once the download starts. */
const DownloadState = ({ done, nudge }: { done: boolean; nudge?: boolean }) => (
  <span className="relative grid size-6 place-items-center">
    <span
      className={cn(
        'col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-(--ease-out-quint) motion-reduce:transition-none',
        done ? 'scale-75 opacity-0' : 'opacity-100',
        nudge && !done && 'group-hover:translate-y-0.5',
      )}
    >
      <Pict d={DOWNLOAD} />
    </span>
    <span
      className={cn(
        'col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-(--ease-out-quint) motion-reduce:transition-none',
        done ? 'opacity-100' : 'scale-75 opacity-0',
      )}
    >
      <Pict d={CHECK} />
    </span>
  </span>
)

const buildMeta = (b: Build) => [b.label, b.ext, b.size].filter(Boolean).join(' / ')
const buildLabel = (p: Platform, b: Build) =>
  `Download for ${p.name}, ${b.label}${b.size ? ` (${b.ext}, ${b.size})` : ` (${b.ext})`}`

/** Apple silicon / Intel: a radio group with a sliding plate, arrow keys move it. */
function ArchSwitch({ value, onChange }: { value: Arch; onChange: (a: Arch) => void }) {
  const options: { v: Arch; l: string }[] = [
    { v: 'arm64', l: 'Apple silicon' },
    { v: 'x64', l: 'Intel' },
  ]
  const index = options.findIndex((o) => o.v === value)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKeyDown = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const next = (index + 1) % options.length
    onChange(options[next].v)
    refs.current[next]?.focus()
  }
  return (
    <div
      aria-label="Mac processor"
      className="border-border relative isolate grid w-max shrink-0 grid-cols-[1fr_1fr] rounded-md border p-0.5"
      role="radiogroup"
      style={{ '--i': index } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="bg-foreground absolute inset-y-0.5 left-0.5 -z-10 w-[calc(50%-0.125rem)] translate-x-[calc(var(--i)*100%)] rounded-[calc(var(--radius)-4px)] transition-transform duration-300 ease-(--ease-out-quint) motion-reduce:transition-none"
      />
      {options.map((o, i) => (
        // biome-ignore lint/a11y/useSemanticElements: ARIA radio-group pattern; a native radio cannot carry the sliding plate.
        <button
          aria-checked={o.v === value}
          className={cn(
            metaClassName,
            'relative h-8 px-3 whitespace-nowrap transition-colors duration-300 ease-(--ease-out-quint) motion-reduce:transition-none',
            'before:absolute before:inset-x-0 before:-inset-y-1.5',
            o.v === value ? 'text-background' : 'text-muted-foreground hover:text-foreground',
          )}
          key={o.v}
          onClick={() => onChange(o.v)}
          onKeyDown={onKeyDown}
          ref={(el) => {
            refs.current[i] = el
          }}
          role="radio"
          tabIndex={o.v === value ? 0 : -1}
          type="button"
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

/**
 * The install buttons. The server (and a phone, or a browser that hides its
 * platform) gets every platform as an equal button; a desktop visitor gets
 * their own as the primary and the rest under "other systems".
 */
export function DownloadActions({
  platforms,
  releasesUrl,
}: {
  platforms: Platform[]
  releasesUrl: string | null
}) {
  const visitor = useSyncExternalStore(subscribe, readVisitor, serverVisitor)
  const [arch, setArch] = useState<Arch>('arm64')
  const [picked, setPicked] = useState(false)
  const [started, setStarted] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (visitor !== 'mac' || picked) return
    let live = true
    detectMacArch().then((a) => {
      if (live && a) setArch(a)
    })
    return () => {
      live = false
    }
  }, [visitor, picked])

  const buildOf = (p: Platform) =>
    p.id === 'mac' ? (p.builds.find((b) => b.key === arch) ?? p.builds[0]) : p.builds[0]
  const keyOf = (p: Platform, b: Build) => `${p.id}:${b.key}`
  const start = (p: Platform, b: Build) => {
    setStarted(keyOf(p, b))
    setAnnouncement(`Download started: ${b.label} for ${p.name}.${p.note ? ` ${p.note}` : ''}`)
  }
  const pickArch = (a: Arch) => {
    setPicked(true)
    setArch(a)
  }

  const mine = platforms.find((p) => p.id === visitor)
  const others = mine ? platforms.filter((p) => p !== mine) : platforms

  const secondary = (p: Platform) => {
    const b = buildOf(p)
    const done = started === keyOf(p, b)
    return (
      <a
        aria-label={buildLabel(p, b)}
        className="pressable border-border hover:border-foreground flex min-h-14 items-center gap-3 rounded-md border px-4 py-3"
        href={b.url}
        key={p.id}
        onClick={() => start(p, b)}
      >
        <BrandMark id={p.id} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-base/snug">{p.name}</span>
          <span className={cn(metaClassName, 'text-muted-foreground')}>{buildMeta(b)}</span>
        </span>
        <span className="text-muted-foreground">
          <DownloadState done={done} />
        </span>
      </a>
    )
  }

  let primary: ReactNode = null
  if (mine) {
    const b = buildOf(mine)
    const done = started === keyOf(mine, b)
    primary = (
      <>
        <a
          aria-label={buildLabel(mine, b)}
          className="pressable group bg-brand text-brand-foreground focus-visible:outline-foreground flex min-h-20 items-center gap-4 rounded-md px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          href={b.url}
          onClick={() => start(mine, b)}
        >
          <BrandMark className="size-7" id={mine.id} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-lg/snug">
              {done ? 'Download started' : `Download for ${mine.name}`}
            </span>
            <span className={metaClassName}>{buildMeta(b)}</span>
          </span>
          <DownloadState done={done} nudge />
        </a>
        {mine.note || (mine.id === 'mac' && mine.builds.length > 1) ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {mine.note ? (
              <p
                className={cn(
                  'flex items-center gap-2 text-sm/snug transition-colors duration-300',
                  started?.startsWith(`${mine.id}:`) ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <span aria-hidden="true" className="bg-brand size-1.5 shrink-0" />
                {mine.note}
              </p>
            ) : null}
            {mine.id === 'mac' && mine.builds.length > 1 ? (
              <ArchSwitch onChange={pickArch} value={arch} />
            ) : null}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {primary}
      {visitor === 'mobile' ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm/snug">
          <span aria-hidden="true" className="bg-brand mt-1.5 size-1.5 shrink-0" />
          This is a desktop app. Open this page on a Mac, Windows or Linux computer to install it.
        </p>
      ) : null}
      {mine && others.length > 0 ? (
        <p className={cn(eyebrowClassName, 'text-muted-foreground mt-4')}>Other systems</p>
      ) : null}
      {others.length > 0 ? <div className="grid gap-3">{others.map(secondary)}</div> : null}
      {releasesUrl ? (
        <a
          className="text-muted-foreground hover:text-foreground decoration-brand mt-2 self-start text-sm underline decoration-2 underline-offset-4 transition-colors"
          href={releasesUrl}
        >
          All releases
        </a>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

/** Repository mode: one primary link to the repo and the clone line to copy. */
export function RepoActions({ repoUrl, showClone }: { repoUrl: string; showClone: boolean }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const slug = repoUrl.replace(/^https:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')
  const clone = `git clone ${repoUrl.replace(/\/$/, '').replace(/(\.git)?$/, '.git')}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(clone)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        className="pressable group bg-brand text-brand-foreground focus-visible:outline-foreground flex min-h-20 items-center gap-4 rounded-md px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        href={repoUrl}
      >
        <BrandMark className="size-7" id="github" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-lg/snug">View on GitHub</span>
          <span className={cn(metaClassName, 'truncate')}>{slug}</span>
        </span>
        <Pict
          className="size-6 transition-transform duration-300 ease-(--ease-out-quint) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          d={OUT}
        />
      </a>
      {showClone ? (
        <>
          <p className={cn(eyebrowClassName, 'text-muted-foreground mt-4')}>Or clone it</p>
          <div className="border-border flex items-stretch overflow-hidden rounded-md border">
            <code className="flex min-w-0 flex-1 items-center px-4 py-3 font-mono text-sm/snug break-all">
              {clone}
            </code>
            <button
              className={cn(
                metaClassName,
                'pressable border-border min-w-24 shrink-0 border-l px-4',
                copied ? 'bg-foreground text-background' : 'hover:bg-muted',
              )}
              onClick={copy}
              type="button"
            >
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

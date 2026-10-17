'use client'

import { Button, FieldLabel, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import { relationshipId } from '@/utilities/relationshipId'
import { nextPollDelay, POLL } from './poll'
import { isSettled, LOOP } from './stage'
import type { VideoStatus } from './status'

/**
 * Reads the video's stage and, by reading it, moves the video along: each
 * answer comes from a pass over Stream (`videoStatusEndpoint`). A run of
 * polling starts when the video is chosen and when the editor presses the
 * button; it paces itself by `nextPollDelay`, skips hidden tabs, asks again
 * the moment the tab is visible, and ends when the stage settles or the run
 * is over.
 */
function useVideoStatus(api: string, videoId: number | string | null) {
  const [status, setStatus] = useState<VideoStatus | null>(null)
  const [offline, setOffline] = useState(false)
  const [since, setSince] = useState(() => Date.now())
  const [over, setOver] = useState(false)

  const refresh = useCallback(async () => {
    if (videoId === null) return
    try {
      const res = await fetch(`${api}/videos/${videoId}/status`, { credentials: 'include' })
      if (!res.ok) {
        setOffline(true)
        return
      }
      setStatus((await res.json()) as VideoStatus)
      setOffline(false)
    } catch {
      setOffline(true)
    }
  }, [api, videoId])

  /** A fresh run: on a new video, and on the button. */
  const restart = useCallback(() => {
    setStatus(null)
    setOver(false)
    setSince(Date.now())
    void refresh()
  }, [refresh])

  useEffect(restart, [restart])

  const settled = status ? isSettled(status.stage) : false
  useEffect(() => {
    if (videoId === null || settled || over) return
    let cancelled = false
    let timer: number | undefined
    function schedule() {
      const delay = nextPollDelay(Date.now() - since)
      if (delay === null) {
        setOver(true)
        return
      }
      timer = window.setTimeout(tick, delay)
    }
    async function tick() {
      if (document.visibilityState === 'visible') await refresh()
      if (!cancelled) schedule()
    }
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      window.clearTimeout(timer)
      void tick()
    }
    schedule()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [over, refresh, settled, since, videoId])

  return { offline, over, restart, status }
}

const DOT: Record<VideoStatus['stage'], string> = {
  pending: 'var(--theme-elevation-400)',
  encoding: 'var(--theme-warning-500)',
  cutting: 'var(--theme-warning-500)',
  encodingLoop: 'var(--theme-warning-500)',
  ready: 'var(--theme-success-500)',
  failed: 'var(--theme-error-500)',
}

const GIVE_UP_MINUTES = POLL.giveUpAfter / 60_000

function detail(status: VideoStatus, over: boolean): string {
  if (over && !isSettled(status.stage))
    return `Stopped checking after ${GIVE_UP_MINUTES} minutes. Stream may still be working on it.`
  switch (status.stage) {
    case 'pending':
      return 'The file has not reached Cloudflare Stream yet. Save again to retry.'
    case 'encoding':
      return 'Cloudflare is encoding the full video. A few minutes for a long one; this page keeps checking.'
    case 'cutting':
      return 'The video is encoded. Cutting the loop next.'
    case 'encodingLoop':
      return status.loop
        ? `Encoding the loop, seconds ${status.loop.start} to ${status.loop.end} of the video.`
        : 'Encoding the loop.'
    case 'ready':
      return status.loop
        ? `${status.durationLabel ?? ''} long; loops seconds ${status.loop.start} to ${status.loop.end} until a visitor presses play.`.trim()
        : `${status.durationLabel ?? ''} long; no longer than a loop, so it loops whole.`.trim()
    case 'failed':
      return status.error ?? 'Stream could not process the file.'
  }
}

/** The one button: a failed pass, or a run that ended, asks for another pass. */
function buttonLabel(status: VideoStatus, over: boolean): string | null {
  if (status.stage === 'failed') return 'Try again'
  if (over && !isSettled(status.stage)) return 'Check again'
  return null
}

/**
 * The encoding panel. On a Video document it reads the document itself; in
 * a block it reads the `video` upload beside it, so the editor who added a
 * video from the page can watch it finish without leaving the page.
 */
export function VideoStatusField({ path }: { path: string }) {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { collectionSlug, id: documentId } = useDocumentInfo()
  const siblingPath = [...path.split('.').slice(0, -1), 'video'].join('.')
  const siblingId = useFormFields(([fields]) => relationshipId(fields[siblingPath]?.value))
  const inDocument = collectionSlug === 'videos'
  const videoId = inDocument ? (documentId ?? null) : siblingId
  const { offline, over, restart, status } = useVideoStatus(api, videoId)

  if (videoId === null) {
    return inDocument ? (
      <Panel label="Encoding">
        <Line>Save to send the file to Cloudflare Stream.</Line>
      </Panel>
    ) : null
  }

  const button = status ? buttonLabel(status, over) : null
  return (
    <Panel label="Encoding">
      {status ? (
        <>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <span
              aria-hidden
              style={{
                animation:
                  isSettled(status.stage) || over ? undefined : 'video-status-pulse 1.4s infinite',
                background: DOT[status.stage],
                borderRadius: '50%',
                display: 'inline-block',
                flex: 'none',
                height: 8,
                width: 8,
              }}
            />
            <span style={{ fontWeight: 600 }}>{status.label}</span>
            {button && (
              <Button buttonStyle="secondary" size="small" onClick={restart}>
                {button}
              </Button>
            )}
          </div>
          <Line>{detail(status, over)}</Line>
          {inDocument && status.stage === 'ready' && (
            <Line muted>
              Change the loop above and save to recut it. Blank fields use the first {LOOP.length}{' '}
              seconds.
            </Line>
          )}
        </>
      ) : (
        <Line muted>{offline ? 'Could not reach the site. Retrying.' : 'Checking Stream.'}</Line>
      )}
      <style>{'@keyframes video-status-pulse{50%{opacity:.35}}'}</style>
    </Panel>
  )
}

const Panel = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <FieldLabel label={label} />
    {children}
  </div>
)

const Line = ({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) => (
  <p style={{ color: muted ? 'var(--theme-elevation-500)' : undefined, fontSize: 12, margin: 0 }}>
    {children}
  </p>
)

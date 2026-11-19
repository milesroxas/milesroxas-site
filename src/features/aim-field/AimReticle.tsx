'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { type AimLock, lockAt } from './aim'
import { normalizeShader, SHADER_COLORS, type ShaderConfig } from './config'
import preset from './preset.json'

const AIM = normalizeShader(preset as Partial<ShaderConfig>)
/** Corners stand this far off the locked rect, as the field's reticle does. */
const PAD = 4

type Box = { x0: number; y0: number; x1: number; y1: number }

const SIDES = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
] as const

/**
 * The aim field's reticle without the field, for a block that wants the brand
 * cursor over its own ground. Over `host` it hides the site cursor (its
 * `[data-aim-host]` rule) and aims: the corners lock onto the control, media
 * or line of text under the pointer (spot orange on a control) and fall back
 * to a cell-snapped box; the ticks spread with speed and kick on press, which
 * flashes the hit marks. Fine pointers only; values from the field's preset.
 */
export function AimReticle({ host }: { host: React.RefObject<HTMLElement | null> }) {
  const plainRef = useRef<HTMLDivElement>(null)
  const blendRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    const plain = plainRef.current
    const blend = blendRef.current
    if (!el || !plain || !blend) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const make = (root: HTMLElement) => {
      const node = document.createElement('div')
      node.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0;'
      root.appendChild(node)
      return node
    }
    const corners = SIDES.map(() => make(plain))
    const hits = SIDES.map(() => make(plain))
    const ticks = SIDES.map(() => make(blend))
    const dot = make(blend)

    el.dataset.aimHost = ''
    el.classList.add('cursor-none', '[&_*]:cursor-none')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const pointer = { x: -1, y: -1 }
    let inside = false
    let on = 0
    let lock: AimLock | null = null
    let dirty = true
    let live = false
    const box: Box = { x0: 0, y0: 0, x1: 0, y1: 0 }
    let speed = 0
    let gap = 0
    let kick = 0
    let pressed = false
    let hitAt = -1
    let clock = 0
    let last = performance.now()
    let prev = { x: 0, y: 0, t: last }
    let raf = 0
    let fg = getComputedStyle(el).color

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      dirty = true
      const now = performance.now()
      const dt = Math.max(1, now - prev.t) / 1000
      speed = Math.max(speed, Math.hypot(e.clientX - prev.x, e.clientY - prev.y) / dt)
      prev = { x: e.clientX, y: e.clientY, t: now }
    }
    const onDown = () => {
      if (!inside) return
      pressed = true
      kick = AIM.recoil
      hitAt = clock
    }
    const onUp = () => {
      pressed = false
    }
    const onLeave = () => {
      inside = false
      pressed = false
    }
    const onScroll = () => {
      dirty = true
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    const themeWatch = new MutationObserver(() => {
      fg = getComputedStyle(el).color
    })
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      clock += dt
      const approach = (ms: number) =>
        ms <= 0 || reduced.matches ? 1 : 1 - Math.exp(-dt / (ms / 3000))

      if (dirty && pointer.x >= 0) {
        dirty = false
        const hit = document.elementFromPoint(pointer.x, pointer.y)
        inside = Boolean(hit && el.contains(hit))
        lock = inside && AIM.aimLock ? lockAt(hit, pointer.x, pointer.y) : null
      }
      on += ((inside ? 1 : 0) - on) * approach(AIM.ease)

      let goal: Box
      if (lock) {
        const r = lock.rect()
        goal = { x0: r.left - PAD, y0: r.top - PAD, x1: r.right + PAD, y1: r.bottom + PAD }
      } else {
        const origin = el.getBoundingClientRect()
        const cell = AIM.cell
        const cx = origin.left + (Math.floor((pointer.x - origin.left) / cell) + 0.5) * cell
        const cy = origin.top + (Math.floor((pointer.y - origin.top) / cell) + 0.5) * cell
        const r = Math.floor(AIM.radius * on * (pressed ? 0.6 : 1) + 0.5)
        const half = r >= 1 ? (r + 1) * cell : 0
        goal = { x0: cx - half, y0: cy - half, x1: cx + half, y1: cy + half }
      }
      if (!live) Object.assign(box, goal)
      live = inside || on > 0.05
      const k = approach(AIM.lockMs)
      box.x0 += (goal.x0 - box.x0) * k
      box.y0 += (goal.y0 - box.y0) * k
      box.x1 += (goal.x1 - box.x1) * k
      box.y1 += (goal.y1 - box.y1) * k

      speed *= Math.exp(-dt / 0.08)
      kick *= Math.exp(-dt / 0.18)
      const base = Math.max(2, AIM.reticle * 0.5)
      const spreadGoal = pressed
        ? base * 0.5 + kick * 0.5
        : base + Math.min(AIM.spread, speed * 0.02) + kick
      gap += (spreadGoal - gap) * approach(60)

      const show = inside ? 'visible' : 'hidden'
      plain.style.visibility = show
      blend.style.visibility = show
      if (!inside) return

      const { stroke, reticle: tick } = AIM
      const { x0, y0, x1, y1 } = box
      const arm = Math.max(3, Math.min(tick * 2, Math.min(x1 - x0, y1 - y0) * 0.25))
      const showBox = x1 - x0 > 4 && y1 - y0 > 4
      const cornerColor = lock?.kind === 'act' ? SHADER_COLORS.spot : fg
      corners.forEach((c, i) => {
        const [v, h] = SIDES[i] ?? SIDES[0]
        c.style.display = showBox ? 'block' : 'none'
        c.style.width = `${arm}px`
        c.style.height = `${arm}px`
        c.style.borderStyle = 'solid'
        c.style.borderColor = cornerColor
        c.style.borderWidth = '0'
        c.style.setProperty(`border-${v}-width`, `${stroke}px`)
        c.style.setProperty(`border-${h}-width`, `${stroke}px`)
        c.style.transform = `translate(${h === 'left' ? x0 : x1 - arm}px, ${v === 'top' ? y0 : y1 - arm}px)`
      })
      const ax = pointer.x
      const ay = pointer.y
      const hitOn = hitAt >= 0 && clock - hitAt < 0.16
      ticks.forEach((t, i) => {
        t.style.width = `${tick}px`
        t.style.height = `${stroke}px`
        t.style.background = '#fff'
        t.style.transform = `translate(${ax}px, ${ay}px) rotate(${i * 90}deg) translate(${gap}px, ${-stroke / 2}px)`
      })
      hits.forEach((m, i) => {
        m.style.display = hitOn ? 'block' : 'none'
        m.style.width = `${tick}px`
        m.style.height = `${stroke}px`
        m.style.background = SHADER_COLORS.spot
        m.style.transform = `translate(${ax}px, ${ay}px) rotate(${45 + i * 90}deg) translate(${gap + 1}px, ${-stroke / 2}px)`
      })
      const ds = Math.max(2, stroke * 1.5)
      dot.style.width = `${ds}px`
      dot.style.height = `${ds}px`
      dot.style.background = '#fff'
      dot.style.transform = `translate(${ax - ds / 2}px, ${ay - ds / 2}px)`
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      themeWatch.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll, { capture: true })
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      plain.replaceChildren()
      blend.replaceChildren()
      delete el.dataset.aimHost
      el.classList.remove('cursor-none', '[&_*]:cursor-none')
    }
  }, [host])

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-40 overflow-hidden"
        ref={plainRef}
      />
      {/* White under difference: the ticks read as inverse ink over paper and over video. */}
      <div
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-40 overflow-hidden mix-blend-difference"
        ref={blendRef}
      />
    </>
  )
}

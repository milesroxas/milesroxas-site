#!/usr/bin/env node
/**
 * Retakes the guide's screenshots (pnpm content-review:guide). Starts the review tool
 * on port 4331 against a temporary copy of guide/demo-reviews.json, so Miles's
 * own judgments are never read or written, drives it into each state the guide
 * describes, pins numbered markers on what the guide's lists refer to, and
 * writes guide/*.jpg. The markers' order matches the numbered lists in guide.html.
 */
import { spawn } from 'node:child_process'
import { copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const GUIDE = join(HERE, 'guide')
const PORT = 4331
const WIDTH = 1440
const reviews = join(tmpdir(), 'brand-review-guide-reviews.json')
copyFileSync(join(GUIDE, 'demo-reviews.json'), reviews)

const server = spawn(process.execPath, [join(HERE, '..', 'review.mjs')], {
  env: { ...process.env, REVIEW_PORT: String(PORT), REVIEWS_PATH: reviews },
  stdio: ['ignore', 'pipe', 'inherit'],
})
await new Promise((ready, fail) => {
  server.stdout.on('data', (chunk) => {
    if (String(chunk).includes('Review tool')) ready()
  })
  server.on('exit', (code) => fail(new Error(`The review server exited (${code}).`)))
})

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 900 },
  deviceScaleFactor: 1.5,
  colorScheme: 'light',
})
const pause = (ms) => page.waitForTimeout(ms)

await page.goto(`http://localhost:${PORT}/`)
await page.waitForSelector('.row')
await page.addStyleTag({
  content:
    '.guide-marker{position:fixed;z-index:9999;width:28px;height:28px;border-radius:50%;background:#c2410c;color:#fff;font:600 14px/28px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 3px #fff,0 2px 8px rgb(0 0 0 / .35);pointer-events:none}' +
    // Room in the panel's margin for markers, so none covers a label.
    '.panel-body{padding-left:46px!important}',
})

/**
 * Numbered markers, 1 first. Each entry is a selector (the first match on
 * screen wins) and where to pin: tl, tr, l, r, bl, bc or rc (the right edge).
 */
async function markers(list) {
  await page.evaluate((entries) => {
    for (const old of document.querySelectorAll('.guide-marker')) old.remove()
    entries.forEach(([selector, place], i) => {
      const visible = (e) => {
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight
      }
      const all = [...document.querySelectorAll(selector)]
      const el = all.find(visible) ?? all[0]
      if (!el) return
      const r = el.getBoundingClientRect()
      const mid = r.top + Math.min(r.height, 56) / 2 - 14
      const spots = {
        tl: [r.left - 10, r.top - 10],
        tr: [r.right - 18, r.top - 10],
        l: [r.left - 36, mid],
        r: [r.right + 6, mid],
        bl: [r.left - 36, r.bottom + 2],
        bc: [r.left + r.width / 2 - 14, r.bottom + 4],
        rc: [r.right - 8, r.top + r.height / 2 - 14],
      }
      const [x, y] = spots[place ?? 'tl']
      const marker = document.createElement('div')
      marker.className = 'guide-marker'
      marker.textContent = String(i + 1)
      marker.style.left = `${Math.max(4, Math.min(x, window.innerWidth - 32))}px`
      marker.style.top = `${Math.max(4, Math.min(y, window.innerHeight - 32))}px`
      document.body.append(marker)
    })
  }, list)
}

const clearMarkers = () => markers([])
const rect = (selector) =>
  page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  }, selector)

async function shot(name, clip) {
  await page.screenshot({ path: join(GUIDE, `${name}.jpg`), type: 'jpeg', quality: 82, clip })
  console.log(`guide/${name}.jpg`)
}

/** The panel, cut at the end of its content. */
async function panelShot(name) {
  const box = await rect('aside.panel')
  const bottom = await page.evaluate(
    () => document.querySelector('#panel').lastElementChild.getBoundingClientRect().bottom,
  )
  await shot(name, { ...box, height: Math.min(box.height, bottom - box.y + 20) })
}

// Pick A and B: the last two outputs of the first case with two or more.
const [keyA, keyB] = await page.evaluate(() => {
  const groups = [...document.querySelectorAll('.case-group')]
  const rows = [
    ...(groups.find((g) => g.querySelectorAll('.row').length > 1) ?? groups[0]).querySelectorAll(
      '.row',
    ),
  ]
  return [rows.at(-2)?.dataset.key, rows.at(-1)?.dataset.key]
})
async function pick(key, alt) {
  await page.evaluate(
    ([k, a]) =>
      document
        .querySelector(`.row[data-key="${CSS.escape(k)}"]`)
        .dispatchEvent(new MouseEvent('click', { bubbles: true, altKey: a })),
    [key, alt],
  )
  await pause(500)
}
await pick(keyA, false)
await pick(keyB, true)
await page.click('.card[data-slot="a"] .card-head')
await pause(300)

// 1. The screen
await markers([
  ['.rail .case-group', 'rc'],
  ['.card[data-slot="b"] .layers', 'tr'],
  ['.card .gutter:has(.badge)', 'l'],
  ['.card mark.claim.missing, .card mark.claim.contradicted', 'r'],
  ['#tabs', 'tl'],
  ['button[data-action="blind"]', 'bc'],
])
await shot('overview')

// 2. Judge blind
await page.click('button[data-action="blind"]')
await pause(300)
await markers([
  ['button[data-action="blind"]', 'bc'],
  ['.stars', 'l'],
  ['.marks', 'l'],
  ['textarea[data-action="notes"]', 'l'],
])
await shot('blind')
await page.click('button[data-action="blind"]')
await pause(300)

// 3. Annotations, up close
await clearMarkers()
await page.click('.card[data-slot="b"] .flags summary')
const hideA = await page.addStyleTag({ content: '.card[data-slot="a"]{visibility:hidden}' })
await pause(200)
await markers([
  ['.card[data-slot="b"] .layers', 'l'],
  ['.card[data-slot="b"] .flags', 'l'],
  ['.card[data-slot="b"] .meters', 'l'],
  ['.card[data-slot="b"] .badges:not(:empty)', 'bl'],
  ['.card[data-slot="b"] mark.claim.missing, .card[data-slot="b"] mark.claim.contradicted', 'r'],
  ['.card[data-slot="b"] .check', 'r'],
])
const card = await rect('.card[data-slot="b"]')
await shot('annotations', {
  x: card.x - 44,
  y: card.y - 12,
  width: card.width + 84,
  height: Math.min(card.height, 900 - card.y) + 12,
})
await hideA.evaluate((tag) => tag.remove())

// 4. Diff
await clearMarkers()
await page.click('button[data-action="diff"]')
await pause(300)
const stage = await rect('#stage')
await shot('diff', { ...stage, height: Math.min(stage.height, 640) })
await page.click('button[data-action="diff"]')
await pause(300)

// Panels: a taller window so each fits whole.
await page.setViewportSize({ width: WIDTH, height: 1500 })
await pause(300)

await page.click('button[data-tab="insights"]')
await pause(300)
await markers([
  ['#panel .grid-table', 'l'],
  ['#panel .verdict', 'l'],
  ['#panel .scatter', 'l'],
])
await panelShot('insights')

await clearMarkers()
await page.click('button[data-tab="knobs"]')
await pause(300)
await panelShot('knobs')

await page.click('button[data-tab="skill"]')
await page.waitForSelector('#panel .diff-file')
await pause(300)
await panelShot('skill-diff')

await page.click('button[data-tab="generate"]')
await pause(300)
await page.click('button[data-action="writer-add"]')
await pause(200)
await page.selectOption('[data-writer="1"] select[data-writer-field="engine"]', 'openai')
await pause(200)
await page.fill('[data-writer="1"] input[data-writer-field="model"]', 'gpt-5.5')
await page.selectOption('[data-writer="1"] select[data-writer-field="effort"]', 'high')
await page.fill('input[data-gen="skillName"]', 'Shorter openings').catch(() => {})
await pause(300)
await markers([
  ['#panel h3', 'l'],
  ['#panel [role="radiogroup"]', 'l'],
  ['#panel .writer-row', 'l'],
])
await panelShot('generate')

await browser.close()
server.kill()

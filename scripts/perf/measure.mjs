// Loads one page in headless Chromium, desktop (default) or mobile, and prints
// navigation timings, LCP and its element, CLS, long tasks, every response by
// size, bytes per third-party host and console errors. Screenshot lands in
// .context/perf/. Run from the repo root:
//
//   node scripts/perf/measure.mjs https://www.milesroxas.com/
//   node scripts/perf/measure.mjs https://www.milesroxas.com/works mobile
import { chromium } from 'playwright'

const url = process.argv[2] || 'https://www.milesroxas.com/'
const mobile = process.argv[3] === 'mobile'
const browser = await chromium.launch()
const ctx = await browser.newContext(
  mobile
    ? {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
)
const page = await ctx.newPage()
const reqs = []
const errors = []
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) errors.push(m.type() + ': ' + m.text().slice(0, 200))
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)))
page.on('response', async (r) => {
  const req = r.request()
  let size = 0
  try {
    const b = await r.body()
    size = b.length
  } catch {}
  const t = req.timing()
  reqs.push({
    url: r.url(),
    status: r.status(),
    type: req.resourceType(),
    size,
    enc: r.headers()['content-encoding'] || '',
    cache: r.headers()['x-vercel-cache'] || r.headers()['cf-cache-status'] || '',
    cc: r.headers()['cache-control'] || '',
    start: t.startTime,
    dur: t.responseEnd,
  })
})
await page.addInitScript(() => {
  window.__perf = { lcp: 0, cls: 0, longTasks: [], lcpEl: '' }
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__perf.lcp = e.startTime
      window.__perf.lcpEl =
        (e.element &&
          e.element.tagName +
            '.' +
            (e.element.className || '').toString().slice(0, 60) +
            ' ' +
            (e.url || '')) ||
        ''
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value
  }).observe({ type: 'layout-shift', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.longTasks.push(Math.round(e.duration))
  }).observe({ type: 'longtask', buffered: true })
})
const t0 = Date.now()
await page.goto(url, { waitUntil: 'load' })
const loadMs = Date.now() - t0
await page.waitForTimeout(4000)
const nav = await page.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0]
  return {
    ttfb: n.responseStart,
    domContentLoaded: n.domContentLoadedEventEnd,
    load: n.loadEventEnd,
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  }
})
const perf = await page.evaluate(() => window.__perf)
const byType = {}
for (const r of reqs) {
  byType[r.type] = byType[r.type] || { n: 0, bytes: 0 }
  byType[r.type].n++
  byType[r.type].bytes += r.size
}
console.log(
  JSON.stringify(
    {
      url,
      mobile,
      loadMs,
      nav,
      lcp: perf.lcp,
      lcpEl: perf.lcpEl,
      cls: perf.cls,
      longTasks: perf.longTasks,
      tbt: perf.longTasks.reduce((a, b) => a + Math.max(0, b - 50), 0),
      totalRequests: reqs.length,
      totalBytes: reqs.reduce((a, r) => a + r.size, 0),
      byType,
    },
    null,
    1,
  ),
)
console.log('--- top 40 by size')
for (const r of [...reqs].sort((a, b) => b.size - a.size).slice(0, 40))
  console.log(
    String(r.size).padStart(8),
    r.type.padEnd(10),
    r.status,
    (r.cache || '').padEnd(6),
    Math.round(r.start).toString().padStart(6),
    Math.round(r.dur).toString().padStart(6),
    r.url.replace('https://www.milesroxas.com', '').slice(0, 150),
  )
console.log('--- third party hosts')
const hosts = {}
for (const r of reqs) {
  const h = new URL(r.url).host
  hosts[h] = hosts[h] || { n: 0, bytes: 0 }
  hosts[h].n++
  hosts[h].bytes += r.size
}
console.log(hosts)
console.log('--- errors', errors.slice(0, 30))
await page.screenshot({ path: `.context/perf/shot-${mobile ? 'mobile' : 'desktop'}.png` })
await browser.close()

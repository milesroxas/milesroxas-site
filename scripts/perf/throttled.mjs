// The same page on a slow phone: Slow 4G (1.6 Mbps down, 150 ms RTT) with a
// 4x CPU slowdown, which is where the hero poster, the video and the scripts
// compete. Prints the timings and the slowest 30 responses in order.
//
//   node scripts/perf/throttled.mjs https://www.milesroxas.com/
import { chromium } from 'playwright'

const url = process.argv[2] || 'https://www.milesroxas.com/'
const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Network.enable')
// Slow 4G-ish: 1.6 Mbps down, 750 kbps up, 150ms RTT
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
})
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
const reqs = []
page.on('response', async (r) => {
  let size = 0
  try {
    size = (await r.body()).length
  } catch {}
  const t = r.request().timing()
  reqs.push({
    url: r.url(),
    type: r.request().resourceType(),
    size,
    start: t.startTime,
    end: t.responseEnd,
  })
})
page.on('requestfailed', (r) =>
  reqs.push({ url: r.url(), type: r.resourceType(), size: 0, failed: r.failure()?.errorText }),
)
await page.addInitScript(() => {
  window.__perf = { lcp: 0, lcpEl: '', longTasks: [], fcp: 0 }
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__perf.lcp = e.startTime
      window.__perf.lcpEl = (e.element?.tagName || '') + ' ' + (e.url || '')
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.longTasks.push(Math.round(e.duration))
  }).observe({ type: 'longtask', buffered: true })
})
const t0 = Date.now()
await page.goto(url, { waitUntil: 'load', timeout: 120000 })
const loadMs = Date.now() - t0
await page.waitForTimeout(3000)
const nav = await page.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0]
  return {
    ttfb: Math.round(n.responseStart),
    dcl: Math.round(n.domContentLoadedEventEnd),
    load: Math.round(n.loadEventEnd),
    fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
  }
})
const perf = await page.evaluate(() => window.__perf)
const t1 = Math.min(...reqs.filter((r) => r.start).map((r) => r.start))
console.log(
  JSON.stringify({
    url,
    loadMs,
    nav,
    lcp: Math.round(perf.lcp),
    lcpEl: perf.lcpEl,
    tbt: perf.longTasks.reduce((a, b) => a + Math.max(0, b - 50), 0),
    longTasks: perf.longTasks.length,
    requests: reqs.length,
    bytes: reqs.reduce((a, r) => a + r.size, 0),
    failed: reqs.filter((r) => r.failed).map((r) => r.url.slice(0, 100) + ' ' + r.failed),
  }),
)
console.log('--- timeline (start→end ms from first request), top 30 by end')
for (const r of reqs
  .filter((r) => r.start)
  .sort((a, b) => b.end - a.end)
  .slice(0, 30))
  console.log(
    String(r.size).padStart(8),
    r.type.padEnd(10),
    String(Math.round(r.start - t1)).padStart(6),
    String(Math.round(r.end - t1)).padStart(6),
    r.url.replace('https://www.milesroxas.com', '').slice(0, 120),
  )
await browser.close()

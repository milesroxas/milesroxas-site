import { chromium, webkit } from 'playwright'

const [, , eng = 'chromium', story = 'default', script = 'back'] = process.argv
const engine = eng === 'webkit' ? webkit : chromium
const url = `http://localhost:6006/iframe.html?id=blocks-interactive-tabs--${story}&viewMode=story`
const browser = await engine.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

await page.evaluate(() => {
  window.__log = []
  const t0 = performance.now()
  const tick = () => {
    const panels = [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => p.children.length)
    window.__log.push({
      t: Math.round(performance.now() - t0),
      panels: panels.map((p) => {
        const plate = p.querySelector('[data-tab-swap="plate"]')
        const copy = [...p.querySelectorAll('[data-tab-swap="copy"]')]
        const pr = plate?.getBoundingClientRect()
        return {
          id: p.id.split('-').at(-1).slice(0, 4),
          st: p.dataset.state.slice(0, 3),
          z: p.style.zIndex,
          clip: plate ? getComputedStyle(plate).clipPath.replace(/px|inset|\(|\)/g, '') : '',
          plOp: plate ? (+getComputedStyle(plate).opacity).toFixed(2) : '',
          copyOp: copy.length ? (+getComputedStyle(copy[0]).opacity).toFixed(2) : '',
          vid: plate?.querySelector('video') ? `rs${plate.querySelector('video').readyState}` : '',
        }
      }),
    })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const click = async (name, wait) => {
  await page.evaluate((n) => window.__log.push({ click: n }), String(name))
  await page.getByRole('tab', { name }).click()
  await page.waitForTimeout(wait)
}
if (script === 'back') {
  await click(/Express/, 500)
  await click(/Position/, 2000)
} else if (script === 'late') {
  await click(/Express/, 1100)
  await click(/Position/, 2000)
} else if (script === 'three') {
  await click(/Express/, 250)
  await click(/Activate/, 250)
  await click(/Position/, 3000)
} else if (script === 'resume') {
  await click(/Express/, 500)
  await click(/Position/, 300)
  await click(/Express/, 2500)
} else if (script === 'empty') {
  await click(/Activate/, 200)
  await click(/Position/, 2000)
} else if (script === 'revisit') {
  await click(/Express/, 2500)
  await click(/Position/, 2500)
}

const log = await page.evaluate(() => window.__log)
let last = ''
for (const e of log) {
  if (e.click) { console.log('---- click', e.click); last = ''; continue }
  const s = e.panels.map((p) => `${p.id}:${p.st} z${p.z} clip[${p.clip}] plOp${p.plOp} copyOp${p.copyOp} ${p.vid}`).join(' | ')
  if (s !== last) console.log(String(e.t).padStart(5), s)
  last = s
}
await browser.close()

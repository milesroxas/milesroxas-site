/** Browser-only helpers: turn a rendered lab SVG into a standalone SVG or an exact-size PNG. */

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

let fontCss: Promise<string> | null = null

/** Every @font-face on the page with its file inlined, so the SVG renders the same as an image. */
function embeddedFonts() {
  fontCss ??= (async () => {
    const rules: string[] = []
    for (const sheet of Array.from(document.styleSheets)) {
      let cssRules: CSSRuleList
      try {
        cssRules = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of Array.from(cssRules)) {
        if (!(rule instanceof CSSFontFaceRule)) continue
        let text = rule.cssText
        for (const [, url] of text.matchAll(/url\("?([^")]+)"?\)/g)) {
          if (!url || url.startsWith('data:')) continue
          const res = await fetch(new URL(url, sheet.href ?? window.location.href))
          if (res.ok) text = text.replace(url, await toDataUrl(await res.blob()))
        }
        rules.push(text)
      }
    }
    return rules.join('\n')
  })()
  return fontCss
}

/** Standalone SVG markup: CSS variables resolved, fonts and remote images inlined. */
export async function standaloneSvg(svg: SVGSVGElement) {
  const styles = getComputedStyle(document.documentElement)
  let markup = new XMLSerializer()
    .serializeToString(svg)
    .replace(
      /var\((--font-[a-z-]+)\)/g,
      (_, name: string) => styles.getPropertyValue(name).trim().replace(/"/g, "'") || 'sans-serif',
    )
  for (const [, href] of markup.matchAll(/href="(https:[^"]+)"/g)) {
    if (!href) continue
    const res = await fetch(href.replace(/&amp;/g, '&'))
    if (res.ok) markup = markup.split(href).join(await toDataUrl(await res.blob()))
  }
  const css = await embeddedFonts()
  return markup.replace(/(<svg[^>]*>)/, `$1<defs><style>${css}</style></defs>`)
}

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

export async function downloadSvg(svg: SVGSVGElement, filename: string) {
  const blob = new Blob([await standaloneSvg(svg)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  download(url, filename)
  URL.revokeObjectURL(url)
}

/** PNG at the SVG's own pixel size (its width and height attributes). */
export async function downloadPng(svg: SVGSVGElement, filename: string) {
  const width = Number(svg.getAttribute('width'))
  const height = Number(svg.getAttribute('height'))
  const url = URL.createObjectURL(new Blob([await standaloneSvg(svg)], { type: 'image/svg+xml' }))
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('SVG failed to load as an image'))
    img.src = url
  })
  // Fonts inside an SVG image can finish decoding a frame after load.
  await new Promise((r) => setTimeout(r, 150))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
  URL.revokeObjectURL(url)
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!png) throw new Error('PNG encode failed')
  const pngUrl = URL.createObjectURL(png)
  download(pngUrl, filename)
  URL.revokeObjectURL(pngUrl)
}

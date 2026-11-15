import type { CSSProperties, ReactElement, ReactNode } from 'react'

import { type BrandConfig, FAMILIES, MONO, PIXEL, SLOGANS } from '../config'
import { CASE, HOME, type LabWork, POSTS, SITE, WORKS, workById } from '../content'
import { createRng, type Rng } from '../random'
import { palette, renderBrand } from '../render'
import { PAGE_SECTIONS, type SectionKey, type SiteConfig } from './config'

type Ctx = { site: SiteConfig; brand: BrandConfig; cols: number }

/** Each consumer seeds its own generator, so render order and dev double-renders never shift values. */
const rngFor = (b: BrandConfig, salt: number): Rng => createRng((b.seed ^ salt) >>> 0)

const pad2 = (n: number) => String(n).padStart(2, '0')
const part = (b: BrandConfig, i: number) => `${b.code}–W${pad2(i + 1)}`
const span = (ctx: Ctx, frac: number) => Math.max(1, Math.round(ctx.cols * frac))
const col = (ctx: Ctx, frac: number, startFrac?: number): CSSProperties =>
  ({
    '--span': span(ctx, frac),
    ...(startFrac === undefined ? {} : { '--start': span(ctx, startFrac) + 1 }),
  }) as CSSProperties

/** Fit one line of display type into a share of the container width. */
const fitType = (text: string, maxPx: number, widthCqw: number, perEm: number) =>
  `min(${maxPx}px, ${(widthCqw / Math.max(1, text.length * perEm)).toFixed(2)}cqw)`

const workIndex = (w: LabWork) => WORKS.indexOf(w)

// Shared pieces -----------------------------------------------------------

function Barcode({ seed, w = 120, h = 28 }: { seed: number; w?: number; h?: number }) {
  const rng = createRng(seed)
  const bars: ReactNode[] = []
  let x = 0
  let i = 0
  while (x < w) {
    const bw = rng.pick([1, 1, 2, 2, 3, 4] as const)
    if (x + bw > w) break
    bars.push(<rect fill="currentColor" height={h} key={i++} width={bw} x={x} y={0} />)
    x += bw + rng.pick([1, 1, 2, 3] as const)
  }
  return (
    <svg aria-hidden="true" className="bs-barcode" height={h} viewBox={`0 0 ${w} ${h}`} width={w}>
      {bars}
    </svg>
  )
}

function Meta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`t-meta ${className}`}>{children}</span>
}

function Thumb({ work, b }: { work: LabWork; b: BrandConfig }) {
  return work.image ? (
    // biome-ignore lint/performance/noImgElement: lab preview, Cloudflare serves the variant.
    <img alt="" className="bs-img" loading="lazy" src={work.image} />
  ) : (
    <div className="bs-ph">
      <Meta>{part(b, workIndex(work))}</Meta>
      <Meta>{work.client}</Meta>
    </div>
  )
}

function WorkCard({ work, ctx }: { work: LabWork; ctx: Ctx }) {
  return (
    <a className="bs-card" href="#work">
      <Thumb b={ctx.brand} work={work} />
      <div className="bs-plate">
        <div className="bs-plate-row">
          <Meta className="fg">{part(ctx.brand, workIndex(work))}</Meta>
          <Meta>{work.capabilities.slice(0, 2).join(' · ')}</Meta>
        </div>
        <p className="t-body lc-h bs-card-title">{work.title}</p>
        <Meta>{work.client}</Meta>
      </div>
    </a>
  )
}

function PartList({ works, ctx, showThumb }: { works: LabWork[]; ctx: Ctx; showThumb?: boolean }) {
  return (
    <div className="bs-parts">
      <div className="bs-parts-head">
        <Meta>part</Meta>
        <Meta>title</Meta>
        <Meta>client</Meta>
        <Meta>role</Meta>
      </div>
      {works.map((w) => (
        <a className="bs-part" href="#work" key={w.id}>
          <Meta className="fg">{part(ctx.brand, workIndex(w))}</Meta>
          <span className="bs-part-title">
            {showThumb && w.image ? (
              // biome-ignore lint/performance/noImgElement: lab preview thumbnail.
              <img alt="" className="bs-part-thumb" loading="lazy" src={w.image} />
            ) : null}
            <span className="t-body lc-h">{w.title}</span>
          </span>
          <span className="t-body muted">{w.client}</span>
          <Meta>{w.role ?? 'n/a'}</Meta>
        </a>
      ))}
    </div>
  )
}

function SectionHead({ n, label, right }: { n: number; label: string; right?: ReactNode }) {
  return (
    <div className="bs-head">
      <Meta className="fg">
        {pad2(n)} / {label}
      </Meta>
      {right ? <Meta>{right}</Meta> : null}
    </div>
  )
}

function Plate({ ctx, title, rows }: { ctx: Ctx; title: string; rows: [string, string][] }) {
  const { brand } = ctx
  return (
    <div className="bs-dataplate">
      <div className="bs-dataplate-head">
        <span className="t-mark" style={{ fontSize: fitType(title, 64, 34, 0.7) }}>
          {title}
        </span>
        <Meta className="fg">®</Meta>
      </div>
      {rows.map(([l, v]) => (
        <div className="bs-plate-row ruled" key={l}>
          <Meta>{l}</Meta>
          <Meta className="fg">{v}</Meta>
        </div>
      ))}
      <div className="bs-dataplate-foot">
        <div>
          <Barcode h={30} seed={brand.seed ^ 0xb1} w={140} />
          <Meta>NO. {String(brand.seed % 10000).padStart(4, '0')}</Meta>
        </div>
        <span className="bs-readout">{brand.code.replace(/\D/g, '') || '00'}</span>
      </div>
    </div>
  )
}

// Navigation --------------------------------------------------------------

function Nav({ ctx }: { ctx: Ctx }) {
  const { site, brand } = ctx
  const v = site.variants.nav
  const active = site.page === 'home' ? -1 : 0
  if (v === 1) {
    return (
      <nav className="bs-dock" aria-label="Site">
        <Meta className="fg">{brand.code}</Meta>
        <a className="bs-key" href="#home">
          <Meta>00</Meta>
          <span className="lc-h">{brand.name}</span>
        </a>
        {SITE.nav.map((l, i) => (
          <a className={`bs-key ${i === active ? 'on' : ''}`} href={`#${l}`} key={l}>
            <Meta>{pad2(i + 1)}</Meta>
            <span className="lc-h">{l}</span>
          </a>
        ))}
        <span className="bs-key">
          <Meta>⌘K</Meta>
          <span className="lc-h">Ask</span>
        </span>
      </nav>
    )
  }
  if (v === 2) {
    return (
      <aside className="bs-rail">
        <span className="bs-rail-name t-meta fg">
          {brand.name} / {SITE.jobTitle}
        </span>
        <nav className="bs-rail-links" aria-label="Site">
          {SITE.nav.map((l, i) => (
            <a className={i === active ? 'on' : ''} href={`#${l}`} key={l}>
              <Meta>{pad2(i + 1)}</Meta>
              <span className="t-body lc-h">{l}</span>
            </a>
          ))}
        </nav>
        <Meta className="fg">{brand.code}</Meta>
      </aside>
    )
  }
  return (
    <header className="bs-sec bs-navbar">
      <span className="t-body lc-h">
        {brand.name}
        <sup className="t-meta fg">™</sup>
      </span>
      <nav className="bs-navlinks" aria-label="Site">
        {SITE.nav.map((l, i) => (
          <a className={i === active ? 'on' : ''} href={`#${l}`} key={l}>
            <Meta>{pad2(i + 1)}</Meta>
            <span className="t-body lc-h">{l}</span>
          </a>
        ))}
      </nav>
      <span className="bs-navend">
        <Meta className="fg">{brand.code}</Meta>
        <span className="bs-key">
          <Meta>⌘K</Meta>
          <span className="lc-h">Ask</span>
        </span>
      </span>
    </header>
  )
}

// Home ---------------------------------------------------------------------

function Hero({ ctx }: { ctx: Ctx }) {
  const { site, brand } = ctx
  const rng = rngFor(brand, 0x4e0)
  const v = site.variants.hero
  if (v === 0) {
    return (
      <section className="bs-poster">
        {renderBrand(brand, { idPrefix: 'site', bare: true, title: 'Opening moment' })}
        <div className="bs-sec bs-g">
          <p className="t-lead lc-h" style={col(ctx, 0.66)}>
            {SITE.tagline}
          </p>
        </div>
      </section>
    )
  }
  if (v === 1) {
    const name = brand.name.toLowerCase()
    return (
      <section className="bs-sec bs-hero-name">
        <h1
          className="t-display"
          style={{ fontSize: fitType(name, 11 * brand.scale * 1.4, 88, 0.52) }}
        >
          {name}
        </h1>
        <div className="bs-led-line">
          <span className="led" />
          <Meta className="fg">{SITE.jobTitle}</Meta>
        </div>
        <div className="bs-g">
          <p className="t-lead lc-h" style={col(ctx, 0.66)}>
            {SITE.tagline}
          </p>
        </div>
        <div className="bs-g bs-spec">
          {SITE.spec.map(([l, val], i) => (
            <div key={l} style={col(ctx, 0.25)}>
              <Meta>
                {pad2(i + 1)} {l}
              </Meta>
              <p className="t-body">{val}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }
  const words = (brand.slogan.trim() || rng.pick(SLOGANS)).toUpperCase().split(/\s+/).slice(0, 4)
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '')
  const hi = rng.int(0, words.length - 1)
  return (
    <section className="bs-sec bs-g bs-hero-slogan">
      <h1 className="bs-slogan" style={col(ctx, 0.58)}>
        {words.map((w, i) => (
          <span
            className={`t-mark ${i === hi ? 'hi' : ''}`}
            key={w}
            style={{ fontSize: fitType(longest, 11 * brand.scale, 52, 0.7) }}
          >
            {w}
          </span>
        ))}
      </h1>
      <div style={col(ctx, 0.34, 0.66)}>
        <Plate
          ctx={ctx}
          rows={[
            ['model', brand.code],
            ['role', 'designer & builder'],
            ['disciplines', 'brand / product / technology'],
            ['base', 'brooklyn, ny'],
          ]}
          title={brand.name.toUpperCase()}
        />
      </div>
    </section>
  )
}

function Overview({ ctx }: { ctx: Ctx }) {
  if (ctx.site.variants.overview === 1) {
    return (
      <section className="bs-sec bs-g bs-overview">
        <div style={col(ctx, 0.34)}>
          <span
            className="t-mark"
            style={{ fontSize: fitType('16', 11 * ctx.brand.scale * 1.6, 30, 0.7) }}
          >
            16
          </span>
          <Meta>years in practice</Meta>
        </div>
        <p className="t-lead lc-h" style={col(ctx, 0.58, 0.42)}>
          {HOME.overview}
        </p>
      </section>
    )
  }
  return (
    <section className="bs-sec bs-g bs-overview">
      <Meta className="fg">00 / overview</Meta>
      <p className="t-lead lc-h" style={col(ctx, 0.75, 0.25)}>
        {HOME.overview}
      </p>
    </section>
  )
}

function Capabilities({ ctx }: { ctx: Ctx }) {
  const v = ctx.site.variants.capabilities
  const live = rngFor(ctx.brand, 0xca9).int(0, HOME.capabilities.length - 1)
  const head = <SectionHead label="capabilities" n={1} right="brand · product · technology" />
  if (v === 1) {
    return (
      <section className="bs-sec">
        {head}
        <div className="bs-g">
          <div className="bs-device" style={col(ctx, 0.34)}>
            {HOME.capabilities.map((c, i) => (
              <div className="bs-device-cell" key={c.title}>
                <Meta>{pad2(i + 1)}</Meta>
                <svg
                  aria-hidden="true"
                  className={`bs-encoder ${i === live ? 'on' : ''}`}
                  viewBox="0 0 40 40"
                >
                  <circle cx="20" cy="20" r="17" />
                  <line
                    x1="20"
                    x2={20 + Math.cos(-0.8 - i) * 17}
                    y1="20"
                    y2={20 + Math.sin(-0.8 - i) * 17}
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="bs-legend" style={col(ctx, 0.58, 0.42)}>
            {HOME.capabilities.map((c, i) => (
              <div className={`bs-legend-row ${i === live ? 'on' : ''}`} key={c.title}>
                <Meta className="fg">{pad2(i + 1)}</Meta>
                <div>
                  <h3 className="t-lead lc-h">{c.title}</h3>
                  <p className="t-body muted">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  if (v === 2) {
    return (
      <section className="bs-sec">
        {head}
        {HOME.capabilities.map((c, i) => (
          <a className="bs-g bs-row" href="#work" key={c.title}>
            <Meta className="fg">{pad2(i + 1)}</Meta>
            <h3 className="t-lead lc-h" style={col(ctx, 0.42, 0.08)}>
              {c.title}
            </h3>
            <p className="t-body muted" style={col(ctx, 0.33)}>
              {c.body}
            </p>
            <Meta>{c.works.length} works →</Meta>
          </a>
        ))}
      </section>
    )
  }
  return (
    <section className="bs-sec">
      {head}
      <div className="bs-g">
        {HOME.capabilities.map((c, i) => (
          <div className="bs-capcol" key={c.title} style={col(ctx, 1 / 3)}>
            <Meta className="fg">{pad2(i + 1)}</Meta>
            <h3 className="t-lead lc-h">{c.title}</h3>
            <p className="t-body muted">{c.body}</p>
            <ul>
              {c.works.map((id) => (
                <li key={id}>
                  <Meta>→ {workById(id).client}</Meta>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function WorkList({ ctx, works, variant }: { ctx: Ctx; works: LabWork[]; variant: number }) {
  if (variant === 1) return <PartList ctx={ctx} showThumb works={works} />
  if (variant === 2) {
    const [first, ...rest] = works
    if (!first) return null
    return (
      <>
        <a className="bs-g bs-feature" href="#work">
          <div style={col(ctx, 0.66)}>
            <Thumb b={ctx.brand} work={first} />
          </div>
          <div className="bs-plate" style={col(ctx, 0.34)}>
            <Meta className="fg">{part(ctx.brand, workIndex(first))}</Meta>
            <h3 className="t-lead lc-h">{first.title}</h3>
            <p className="t-body muted">{first.description}</p>
            <Meta>
              {first.client} / {first.role}
            </Meta>
          </div>
        </a>
        <PartList ctx={ctx} works={rest} />
      </>
    )
  }
  return (
    <div className="bs-g bs-cards">
      {works.map((w) => (
        <div key={w.id} style={col(ctx, 0.5)}>
          <WorkCard ctx={ctx} work={w} />
        </div>
      ))}
    </div>
  )
}

function Selected({ ctx }: { ctx: Ctx }) {
  const works = [17, 15, 14, 10].map(workById)
  return (
    <section className="bs-sec">
      <SectionHead label="selected work" n={2} right={`${works.length} of ${WORKS.length} →`} />
      <WorkList ctx={ctx} variant={ctx.site.variants.selected} works={works} />
    </section>
  )
}

function About({ ctx }: { ctx: Ctx }) {
  const prose = (
    <div className="bs-prose" style={col(ctx, 0.58, 0.42)}>
      <h2 className="t-lead lc-h">{HOME.about.heading}</h2>
      {HOME.about.paragraphs.map((p) => (
        <p className="t-body" key={p.slice(0, 24)}>
          {p}
        </p>
      ))}
    </div>
  )
  if (ctx.site.variants.about === 1) {
    return (
      <section className="bs-sec bs-g">
        <div className="bs-specsheet" style={col(ctx, 0.34)}>
          <SectionHead label="about" n={3} />
          {[
            ['role', 'designer & builder'],
            ['studio', 'suits & sandals, co-founder'],
            ['disciplines', 'brand / product / technology'],
            ['base', 'brooklyn, ny'],
            ['practice', '16 yrs'],
          ].map(([l, v]) => (
            <div className="bs-plate-row ruled" key={l}>
              <Meta>{l}</Meta>
              <span className="t-body">{v}</span>
            </div>
          ))}
        </div>
        {prose}
      </section>
    )
  }
  return (
    <section className="bs-sec bs-g">
      <Meta className="fg">03 / about</Meta>
      {prose}
    </section>
  )
}

function Writing({ ctx }: { ctx: Ctx }) {
  if (ctx.site.variants.writing === 1) {
    return (
      <section className="bs-sec">
        <SectionHead label="writing" n={4} right="all posts →" />
        <div className="bs-g">
          {POSTS.map((p, i) => (
            <a className="bs-postcard" href="#post" key={p.title} style={col(ctx, 0.5)}>
              <Meta className="fg">P–{pad2(i + 1)}</Meta>
              <h3 className="t-lead lc-h">{p.title}</h3>
              <Meta>{p.date}</Meta>
            </a>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section className="bs-sec">
      <SectionHead label="writing" n={4} right="all posts →" />
      {POSTS.map((p) => (
        <a className="bs-receipt" href="#post" key={p.title}>
          <Meta>{p.date}</Meta>
          <span className="t-body lc-h">{p.title}</span>
          <span className="bs-leader" />
          <Meta className="fg">read →</Meta>
        </a>
      ))}
    </section>
  )
}

// Works index ----------------------------------------------------------------

function WorksHeader({ ctx }: { ctx: Ctx }) {
  if (ctx.site.variants.worksHeader === 1) {
    const caps = new Map<string, number>()
    for (const w of WORKS) for (const c of w.capabilities) caps.set(c, (caps.get(c) ?? 0) + 1)
    return (
      <section className="bs-sec">
        <h1 className="t-lead lc-h">Work</h1>
        <div className="bs-keys">
          <span className="bs-key on">
            <Meta>{WORKS.length}</Meta>
            <span className="lc-h">All</span>
          </span>
          {[...caps.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([c, n]) => (
              <span className="bs-key" key={c}>
                <Meta>{n}</Meta>
                <span className="lc-h">{c}</span>
              </span>
            ))}
        </div>
      </section>
    )
  }
  return (
    <section className="bs-sec bs-works-head">
      <h1
        className="t-display"
        style={{ fontSize: fitType('work', 11 * ctx.brand.scale * 1.4, 40, 0.52) }}
      >
        work
      </h1>
      <Meta className="fg">{pad2(WORKS.length)} entries / brand · product · technology</Meta>
    </section>
  )
}

// Case study -------------------------------------------------------------------

function CaseHero({ ctx }: { ctx: Ctx }) {
  const { brand } = ctx
  const work = workById(CASE.workId)
  const v = ctx.site.variants.caseHero
  const specs: [string, string][] = [
    ['client', work.client],
    ['role', work.role ?? 'n/a'],
    ['capabilities', work.capabilities.join(' / ')],
    ['platforms', CASE.platforms],
  ]
  const image = (
    // biome-ignore lint/performance/noImgElement: lab preview, Cloudflare serves the variant.
    <img alt="" className="bs-img" src={work.image ?? ''} />
  )
  if (v === 1) {
    return (
      <section className="bs-casehero">
        <div className="bs-bleed">{image}</div>
        <div className="bs-sec">
          <div className="bs-g bs-spec">
            {specs.map(([l, val], i) => (
              <div key={l} style={col(ctx, 0.25)}>
                <Meta>
                  {pad2(i + 1)} {l}
                </Meta>
                <p className="t-body">{val}</p>
              </div>
            ))}
          </div>
          <div className="bs-g">
            <h1 className="t-lead lc-h bs-case-title" style={col(ctx, 0.66)}>
              {work.title}
            </h1>
            <p className="t-body muted" style={col(ctx, 0.5)}>
              {work.description}
            </p>
          </div>
        </div>
      </section>
    )
  }
  if (v === 2) {
    const name = work.client.toUpperCase()
    return (
      <section className="bs-sec bs-casehero">
        <span className="t-mark" style={{ fontSize: fitType(name, 11 * brand.scale, 90, 0.7) }}>
          {name}
        </span>
        <div className="bs-led-line">
          <span className="led fl" />
          <Meta className="fg">{work.title}</Meta>
        </div>
        <Meta>
          {part(brand, workIndex(work))} / {work.role}
        </Meta>
        <div className="bs-casehero-img">{image}</div>
      </section>
    )
  }
  return (
    <section className="bs-sec bs-casehero">
      <Meta className="fg">part {part(brand, workIndex(work))} / case study</Meta>
      <div className="bs-g">
        <div style={col(ctx, 0.66)}>
          <h1 className="t-lead lc-h bs-case-title">{work.title}</h1>
          <p className="t-body muted">{work.description}</p>
        </div>
        <div className="bs-specsheet" style={col(ctx, 0.34, 0.66)}>
          {specs.map(([l, val]) => (
            <div className="bs-plate-row ruled" key={l}>
              <Meta>{l}</Meta>
              <Meta className="fg">{val}</Meta>
            </div>
          ))}
        </div>
      </div>
      <div className="bs-casehero-img">{image}</div>
      <Meta>fig. 01 / results screen</Meta>
    </section>
  )
}

function Chapter({ ctx, i, wide }: { ctx: Ctx; i: number; wide?: boolean }) {
  const c = CASE.chapters[i]
  if (!c) return null
  return (
    <article className="bs-chapter" id={`ch${i + 1}`}>
      <h2 className="t-lead lc-h">{c.heading}</h2>
      <p className="t-body">{c.body}</p>
      <div className="bs-outcome" style={wide ? undefined : { maxWidth: '60ch' }}>
        <Meta className="fg">→ what I built</Meta>
        <p className="t-body">{c.outcome}</p>
      </div>
      {ctx.site.variants.story === 2 && i === 1 ? <Pull ctx={ctx} /> : null}
    </article>
  )
}

function Pull({ ctx }: { ctx: Ctx }) {
  const words = CASE.pull.toUpperCase().replace(/\.$/, '').split(' ')
  return (
    <blockquote className="bs-pull">
      {words.map((w, i) => (
        <span
          className={`t-mark ${i === words.length - 1 ? 'hi' : ''}`}
          key={`${w}-${i.toString()}`}
          style={{ fontSize: `min(${11 * ctx.brand.scale * 0.55}px, 5.4cqw)` }}
        >
          {w}{' '}
        </span>
      ))}
    </blockquote>
  )
}

function Story({ ctx }: { ctx: Ctx }) {
  if (ctx.site.variants.story === 1) {
    return (
      <section className="bs-sec bs-g bs-story">
        <nav className="bs-toc" style={col(ctx, 0.25)} aria-label="Chapters">
          {CASE.chapters.map((c, i) => (
            <a className={i === 0 ? 'on' : ''} href={`#ch${i + 1}`} key={c.heading}>
              <Meta className="fg">{pad2(i + 1)}</Meta>
              <span className="t-body lc-h">{c.heading}</span>
            </a>
          ))}
        </nav>
        <div style={col(ctx, 0.66, 0.34)}>
          {CASE.chapters.map((c, i) => (
            <Chapter ctx={ctx} i={i} key={c.heading} wide />
          ))}
        </div>
      </section>
    )
  }
  return (
    <section className="bs-sec bs-story">
      {CASE.chapters.map((c, i) => (
        <div className="bs-g" key={c.heading}>
          <Meta className="fg">ch. {pad2(i + 1)}</Meta>
          <div style={col(ctx, 0.66, 0.25)}>
            <Chapter ctx={ctx} i={i} />
          </div>
        </div>
      ))}
    </section>
  )
}

function Related({ ctx }: { ctx: Ctx }) {
  const works = CASE.related.map(workById)
  if (ctx.site.variants.related === 1) {
    const [next, ...rest] = works
    return (
      <section>
        <a className="bs-nextbar" href="#next">
          <Meta>next / {next ? part(ctx.brand, workIndex(next)) : ''}</Meta>
          <span className="t-lead lc-h">{next?.title} →</span>
        </a>
        <div className="bs-sec">
          <PartList ctx={ctx} works={rest} />
        </div>
      </section>
    )
  }
  return (
    <section className="bs-sec">
      <SectionHead label="related work" n={9} right="all work →" />
      <div className="bs-g bs-cards">
        {works.map((w) => (
          <div key={w.id} style={col(ctx, 1 / 3)}>
            <WorkCard ctx={ctx} work={w} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Footer ------------------------------------------------------------------

function Footer({ ctx }: { ctx: Ctx }) {
  const { brand } = ctx
  const phrase =
    `designed and built by ${brand.name} · brooklyn ny · ${brand.code} · `.toUpperCase()
  return (
    <footer className="bs-footer">
      {ctx.site.variants.footer === 1 ? (
        <div className="bs-bar">
          <span className="t-meta">{phrase.repeat(8)}</span>
        </div>
      ) : null}
      <div className="bs-sec bs-g bs-colophon">
        <div style={col(ctx, 1 / 3)}>
          <p className="t-body lc-h">
            {brand.name}
            <sup className="t-meta fg">™</sup>
          </p>
          <Meta>designed and built by {brand.name} / brooklyn, ny</Meta>
        </div>
        <nav style={col(ctx, 1 / 3)} aria-label="Footer">
          {SITE.nav.map((l, i) => (
            <a href={`#${l}`} key={l}>
              <Meta>
                {pad2(i + 1)} {l}
              </Meta>
            </a>
          ))}
        </nav>
        <div className="bs-colophon-end" style={col(ctx, 1 / 3)}>
          <Barcode seed={brand.seed ^ 0xb2} />
          <Meta>
            {brand.code} / NO. {String(brand.seed % 10000).padStart(4, '0')} / © {brand.name}
          </Meta>
        </div>
      </div>
    </footer>
  )
}

// Entry -------------------------------------------------------------------

const SECTION_RENDERERS: Partial<Record<SectionKey, (ctx: Ctx) => ReactNode>> = {
  hero: (ctx) => <Hero ctx={ctx} />,
  overview: (ctx) => <Overview ctx={ctx} />,
  capabilities: (ctx) => <Capabilities ctx={ctx} />,
  selected: (ctx) => <Selected ctx={ctx} />,
  about: (ctx) => <About ctx={ctx} />,
  writing: (ctx) => <Writing ctx={ctx} />,
  worksHeader: (ctx) => <WorksHeader ctx={ctx} />,
  worksList: (ctx) => (
    <section className="bs-sec">
      <WorkList ctx={ctx} variant={ctx.site.variants.worksList} works={WORKS} />
    </section>
  ),
  caseHero: (ctx) => <CaseHero ctx={ctx} />,
  story: (ctx) => <Story ctx={ctx} />,
  related: (ctx) => <Related ctx={ctx} />,
  footer: (ctx) => <Footer ctx={ctx} />,
}

function siteVars(brand: BrandConfig, site: SiteConfig): CSSProperties {
  const pal = palette(brand)
  return {
    '--bg': pal.bg,
    '--fg': pal.fg,
    '--muted': pal.muted,
    '--mark': pal.mark,
    '--on-mark': pal.onMark,
    '--fluoro': brand.fluoroOn ? pal.fluoro : pal.mark,
    '--bar': pal.barFill,
    '--on-bar': pal.onBar,
    '--grid-line': `color-mix(in srgb, ${pal.fg} ${(brand.gridOpacity * 100).toFixed(0)}%, transparent)`,
    '--sans': FAMILIES[brand.family].css,
    '--mono': MONO,
    '--pixel': PIXEL,
    '--wf': brand.frameWeight,
    '--wm': Math.min(brand.momentWeight, FAMILIES[brand.family].maxWeight),
    '--tr': `${brand.momentTracking}em`,
    '--cols': brand.columns,
    '--m': `${(brand.margin * 100).toFixed(2)}cqw`,
    '--lead': site.lead,
  } as CSSProperties
}

/** Pure: a site config (brand and seed included) always draws the same page. */
export function renderSite(site: SiteConfig): ReactElement {
  const brand = site.brand
  const ctx: Ctx = { site, brand, cols: brand.columns }
  const sections = PAGE_SECTIONS[site.page].filter((s) => s.key !== 'nav')
  const rail = site.variants.nav === 2
  const dock = site.variants.nav === 1
  return (
    <div
      className={`bs bs-case-${site.caseMode} ${rail ? 'bs-has-rail' : ''}`}
      style={siteVars(brand, site)}
    >
      <div aria-hidden="true" className="bs-grid">
        {Array.from({ length: brand.columns }, (_, i) => (
          <span key={`c${i.toString()}`} />
        ))}
      </div>
      {dock ? null : <Nav ctx={ctx} />}
      <main className="bs-main">
        {sections.map((s) => (
          <div className="bs-slot" data-section={s.key} key={s.key}>
            {SECTION_RENDERERS[s.key]?.(ctx)}
          </div>
        ))}
      </main>
      {dock ? <Nav ctx={ctx} /> : null}
    </div>
  )
}

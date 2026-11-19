import { type BrandConfig, DEFAULT_CONFIG, normalizeConfig } from '../config'

export const PAGES = ['home', 'works', 'case'] as const
export type Page = (typeof PAGES)[number]
export const PAGE_LABELS: Record<Page, string> = {
  home: 'home',
  works: 'work index',
  case: 'case study',
}

export type SectionKey =
  | 'nav'
  | 'hero'
  | 'overview'
  | 'capabilities'
  | 'selected'
  | 'about'
  | 'writing'
  | 'worksHeader'
  | 'worksList'
  | 'caseHero'
  | 'story'
  | 'related'
  | 'footer'

type Variant = { label: string; moment?: boolean }
export type SectionDef = { key: SectionKey; label: string; variants: Variant[] }

const NAV: SectionDef = {
  key: 'nav',
  label: 'navigation',
  variants: [{ label: 'spec bar' }, { label: 'dock keys' }, { label: 'index rail (90°)' }],
}
const FOOTER: SectionDef = {
  key: 'footer',
  label: 'footer',
  variants: [{ label: 'colophon' }, { label: 'bar + colophon' }],
}

/** Every section a page shows, with its variants. A variant marked `moment` spends the page's one moment (rule 1). */
export const PAGE_SECTIONS: Record<Page, SectionDef[]> = {
  home: [
    NAV,
    {
      key: 'hero',
      label: 'opening',
      variants: [
        { label: 'poster moment', moment: true },
        { label: 'name + spec', moment: false },
        { label: 'slogan + data plate', moment: true },
      ],
    },
    {
      key: 'overview',
      label: 'overview',
      variants: [{ label: 'lead statement' }, { label: 'big numeral', moment: true }],
    },
    {
      key: 'capabilities',
      label: 'capabilities',
      variants: [{ label: 'spec columns' }, { label: 'control map' }, { label: 'ruled rows' }],
    },
    {
      key: 'selected',
      label: 'selected work',
      variants: [{ label: 'plate cards' }, { label: 'part list' }, { label: 'feature + list' }],
    },
    {
      key: 'about',
      label: 'about',
      variants: [{ label: 'label + prose' }, { label: 'spec sheet + prose' }],
    },
    {
      key: 'writing',
      label: 'writing',
      variants: [{ label: 'receipt rows' }, { label: 'numbered index' }],
    },
    FOOTER,
  ],
  works: [
    NAV,
    {
      key: 'worksHeader',
      label: 'index header',
      variants: [{ label: 'quiet count' }, { label: 'capability keys' }],
    },
    {
      key: 'worksList',
      label: 'work list',
      variants: [{ label: 'plate cards' }, { label: 'part list' }, { label: 'feature + list' }],
    },
    FOOTER,
  ],
  case: [
    NAV,
    {
      key: 'caseHero',
      label: 'case opening',
      variants: [
        { label: 'title + data plate' },
        { label: 'image + spec band' },
        { label: 'name code moment', moment: true },
      ],
    },
    {
      key: 'story',
      label: 'story',
      variants: [
        { label: 'numbered chapters' },
        { label: 'manual index' },
        { label: 'chapters + pull', moment: true },
      ],
    },
    {
      key: 'related',
      label: 'related work',
      variants: [{ label: 'plate cards' }, { label: 'next bar' }],
    },
    FOOTER,
  ],
}

export const CASE_MODES = ['nav', 'none'] as const
export type CaseMode = (typeof CASE_MODES)[number]

export type SiteConfig = {
  version: 1
  kind: 'site'
  page: Page
  viewport: 'desktop' | 'mobile'
  caseMode: CaseMode
  lead: number
  variants: Record<SectionKey, number>
  brand: BrandConfig
}

export const DEFAULT_VARIANTS: Record<SectionKey, number> = {
  nav: 0,
  hero: 0,
  overview: 0,
  capabilities: 0,
  selected: 0,
  about: 0,
  writing: 0,
  worksHeader: 0,
  worksList: 1,
  caseHero: 0,
  story: 0,
  related: 0,
  footer: 0,
}

export const DEFAULT_SITE: SiteConfig = {
  version: 1,
  kind: 'site',
  page: 'home',
  viewport: 'desktop',
  caseMode: 'nav',
  lead: 1.9,
  variants: DEFAULT_VARIANTS,
  brand: DEFAULT_CONFIG,
}

const variantCount = (key: SectionKey) => {
  for (const sections of Object.values(PAGE_SECTIONS)) {
    const def = sections.find((s) => s.key === key)
    if (def) return def.variants.length
  }
  return 1
}

export function normalizeSite(input: Partial<SiteConfig> | null | undefined): SiteConfig {
  const c = input ?? {}
  const variants = { ...DEFAULT_VARIANTS }
  for (const key of Object.keys(variants) as SectionKey[]) {
    const v = c.variants?.[key]
    if (typeof v === 'number' && Number.isFinite(v)) {
      variants[key] = Math.min(variantCount(key) - 1, Math.max(0, Math.round(v)))
    }
  }
  return {
    version: 1,
    kind: 'site',
    page: PAGES.includes(c.page as Page) ? (c.page as Page) : DEFAULT_SITE.page,
    viewport: c.viewport === 'mobile' ? 'mobile' : 'desktop',
    caseMode: CASE_MODES.includes(c.caseMode as CaseMode) ? (c.caseMode as CaseMode) : 'nav',
    lead:
      typeof c.lead === 'number' && Number.isFinite(c.lead)
        ? Math.min(3, Math.max(1, c.lead))
        : DEFAULT_SITE.lead,
    variants,
    brand: normalizeConfig(c.brand),
  }
}

/** Sections on the page that spend a moment; more than one breaks rule 1. */
export function momentsOn(site: SiteConfig) {
  return PAGE_SECTIONS[site.page].filter((s) => s.variants[site.variants[s.key]]?.moment)
}

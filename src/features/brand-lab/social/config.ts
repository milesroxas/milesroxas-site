import { type BrandConfig, DEFAULT_CONFIG, normalizeConfig } from '../config'
import { POSTS, WORKS } from '../content'

/** Common platform sizes in pixels; exports render at exactly these. */
export const FORMATS = {
  'ig-square': { label: 'instagram square', w: 1080, h: 1080 },
  'ig-portrait': { label: 'instagram portrait 4:5', w: 1080, h: 1350 },
  story: { label: 'story / reel / short 9:16', w: 1080, h: 1920 },
  linkedin: { label: 'linkedin / og 1.91:1', w: 1200, h: 627 },
  'x-post': { label: 'x post 16:9', w: 1600, h: 900 },
  youtube: { label: 'youtube thumbnail', w: 1280, h: 720 },
} as const
export type Format = keyof typeof FORMATS
export const FORMAT_IDS = Object.keys(FORMATS) as Format[]

export const TEMPLATES = {
  thumb: 'youtube thumbnail',
  case: 'new case study',
  post: 'new post',
  quote: 'pull quote',
  moment: 'brand moment (poster)',
} as const
export type Template = keyof typeof TEMPLATES
export const TEMPLATE_IDS = Object.keys(TEMPLATES) as Template[]

export type SocialConfig = {
  version: 1
  kind: 'social'
  format: Format
  template: Template
  workId: number
  postIndex: number
  /** Overrides the template's headline; thumbnails keep it to four words. */
  headline: string
  showAll: boolean
  brand: BrandConfig
}

export const DEFAULT_SOCIAL: SocialConfig = {
  version: 1,
  kind: 'social',
  format: 'youtube',
  template: 'thumb',
  workId: 17,
  postIndex: 0,
  headline: '',
  showAll: false,
  brand: DEFAULT_CONFIG,
}

export function normalizeSocial(input: Partial<SocialConfig> | null | undefined): SocialConfig {
  const c = input ?? {}
  return {
    version: 1,
    kind: 'social',
    format: FORMAT_IDS.includes(c.format as Format) ? (c.format as Format) : DEFAULT_SOCIAL.format,
    template: TEMPLATE_IDS.includes(c.template as Template)
      ? (c.template as Template)
      : DEFAULT_SOCIAL.template,
    workId: WORKS.some((w) => w.id === c.workId) ? (c.workId as number) : DEFAULT_SOCIAL.workId,
    postIndex:
      typeof c.postIndex === 'number' && c.postIndex >= 0 && c.postIndex < POSTS.length
        ? Math.round(c.postIndex)
        : 0,
    headline: typeof c.headline === 'string' ? c.headline.slice(0, 60) : '',
    showAll: c.showAll === true,
    brand: normalizeConfig(c.brand),
  }
}

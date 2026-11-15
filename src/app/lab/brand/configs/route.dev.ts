import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { normalizeConfig } from '@/features/brand-lab/config'
import { normalizeShader } from '@/features/brand-lab/shader/config'
import { normalizeSite } from '@/features/brand-lab/site/config'
import { normalizeSocial } from '@/features/brand-lab/social/config'

const DIR = path.join(process.cwd(), 'src/features/brand-lab/configs')
const RELATIVE = 'src/features/brand-lab/configs'

const devOnly = () =>
  process.env.NODE_ENV === 'production' ? new Response(null, { status: 404 }) : null

export async function GET() {
  const blocked = devOnly()
  if (blocked) return blocked
  await mkdir(DIR, { recursive: true })
  const files = (await readdir(DIR))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
  const parsed = await Promise.all(
    files.map(async (file) => ({
      file,
      raw: JSON.parse(await readFile(path.join(DIR, file), 'utf8')),
    })),
  )
  // Moments, site, social and shader configs share the folder; `kind` tells them apart.
  const configs = parsed
    .filter(({ raw }) => !['site', 'social', 'shader'].includes(raw?.kind))
    .map(({ file, raw }) => ({ file, config: normalizeConfig(raw) }))
  const sites = parsed
    .filter(({ raw }) => raw?.kind === 'site')
    .map(({ file, raw }) => ({ file, config: normalizeSite(raw) }))
  const socials = parsed
    .filter(({ raw }) => raw?.kind === 'social')
    .map(({ file, raw }) => ({ file, config: normalizeSocial(raw) }))
  const shaders = parsed
    .filter(({ raw }) => raw?.kind === 'shader')
    .map(({ file, raw }) => ({ file, config: normalizeShader(raw) }))
  return Response.json({ configs, sites, socials, shaders })
}

export async function POST(request: Request) {
  const blocked = devOnly()
  if (blocked) return blocked
  const body = await request.json()
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
  const site = body?.kind === 'site' ? normalizeSite(body) : null
  const social = body?.kind === 'social' ? normalizeSocial(body) : null
  const shader = body?.kind === 'shader' ? normalizeShader(body) : null
  const moment = site || social || shader ? null : normalizeConfig(body)
  const config = site ?? social ?? shader ?? moment
  const file = site
    ? `${stamp}-site-${site.page}-${site.brand.seed}.json`
    : social
      ? `${stamp}-social-${social.format}-${social.template}-${social.brand.seed}.json`
      : shader
        ? `${stamp}-shader-${shader.shape}-${shader.cursor}-${shader.seed}.json`
        : `${stamp}-${moment?.mode}-${moment?.seed}.json`
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, file), `${JSON.stringify(config, null, 2)}\n`)
  return Response.json({ path: `${RELATIVE}/${file}` })
}

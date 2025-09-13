import canUseDOM from './canUseDOM'

/**
 * Resolves a canonical site URL using environment-first detection.
 * Priority:
 * 1) NEXT_PUBLIC_SERVER_URL (explicit, recommended; must include protocol)
 * 2) VERCEL_URL (runtime for preview/prod; protocol is always https)
 * 3) VERCEL_PROJECT_PRODUCTION_URL (production canonical domain from Vercel projects)
 * 4) http://localhost:3000 (development default)
 */
function resolveSiteURL(): string {
  // 1) Explicit override
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL
  if (explicit && typeof explicit === 'string') return explicit

  // 2) Vercel runtime URL (no protocol)
  const vercelRuntime = process.env.VERCEL_URL
  if (vercelRuntime && typeof vercelRuntime === 'string') return `https://${vercelRuntime}`

  // 3) Vercel project production URL (no protocol)
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd && typeof vercelProd === 'string') return `https://${vercelProd}`

  // 4) Local default
  return 'http://localhost:3000'
}

export const getServerSideURL = (): string => {
  return resolveSiteURL()
}

export const getClientSideURL = (): string => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port
    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }
  return resolveSiteURL()
}

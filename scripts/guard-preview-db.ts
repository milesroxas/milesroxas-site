/**
 * `pnpm ci` runs `payload migrate` before every Vercel build. Preview deploys
 * (the `dev` branch) must point at the Neon preview branch, never production.
 * If the Preview-scoped POSTGRES_URL on Vercel is ever wrong (an env var copied
 * across environments, a store reconnected with production credentials) the
 * build would migrate production instead.
 *
 * This refuses to continue when a non-production Vercel build sees the
 * production endpoint. `PRODUCTION_DB_ENDPOINT` is the Neon endpoint id of the
 * production branch (`ep-...`), set as a plain Vercel env var for every
 * environment. Outside Vercel (local `pnpm ci`, CI without VERCEL_ENV) it is a
 * no-op.
 */

const vercelEnv = process.env.VERCEL_ENV
const productionEndpoint = process.env.PRODUCTION_DB_ENDPOINT
const url = process.env.POSTGRES_URL

if (!vercelEnv || vercelEnv === 'production') {
  process.exit(0)
}

if (!productionEndpoint) {
  console.error(
    `guard-preview-db: PRODUCTION_DB_ENDPOINT is not set for VERCEL_ENV=${vercelEnv}. Refusing to migrate an unknown database.`,
  )
  process.exit(1)
}

let host = ''
try {
  host = url ? new URL(url).hostname : ''
} catch {
  host = ''
}

if (!host) {
  console.error(
    `guard-preview-db: POSTGRES_URL is missing or malformed for VERCEL_ENV=${vercelEnv}. Set the Preview-scoped POSTGRES_URL on Vercel to the Neon preview branch.`,
  )
  process.exit(1)
}

if (host.startsWith(`${productionEndpoint}.`) || host.startsWith(`${productionEndpoint}-`)) {
  console.error(
    `guard-preview-db: VERCEL_ENV=${vercelEnv} is pointed at the production Neon endpoint (${productionEndpoint}). ` +
      'This build would migrate production. Aborting. ' +
      'Point the Preview-scoped POSTGRES_URL on Vercel at the Neon preview branch.',
  )
  process.exit(1)
}

console.log(`guard-preview-db: VERCEL_ENV=${vercelEnv} is using ${host}, not production.`)

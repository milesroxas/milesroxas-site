/**
 * `pnpm ci` runs `payload migrate` before every Vercel build, so the build's
 * ref and database must match the environment being built:
 *
 * - Production builds come only from `main`, the one ref allowed to migrate
 *   and deploy production. `vercel deploy --prod` from a branch or worktree,
 *   or a promote that rebuilds another ref, is refused.
 * - A preview build must point at the Neon preview branch, never production.
 *   The Neon integration injects that branch's credentials by webhook into
 *   git-triggered previews only; a CLI `vercel deploy` builds a preview with
 *   production credentials (seen 2026-10-16), which the host check refuses.
 *
 * `PRODUCTION_DB_ENDPOINT` is the Neon endpoint id of the production branch
 * (`ep-...`), set as a plain Vercel env var for every environment. Outside
 * Vercel (local `pnpm ci`, CI without VERCEL_ENV) this is a no-op.
 */

const PRODUCTION_REF = 'main'
const PREVIEW_REF = 'dev'

const vercelEnv = process.env.VERCEL_ENV
const ref = process.env.VERCEL_GIT_COMMIT_REF || '(no git ref)'
const productionEndpoint = process.env.PRODUCTION_DB_ENDPOINT
const url = process.env.POSTGRES_URL

function refuse(message: string): never {
  console.error(`guard-preview-db: ${message}`)
  process.exit(1)
}

if (!vercelEnv) {
  process.exit(0)
}

if (vercelEnv === 'production') {
  if (ref !== PRODUCTION_REF) {
    refuse(
      `VERCEL_ENV=production from ref ${ref}. Only \`${PRODUCTION_REF}\` may migrate and deploy production. ` +
        'Release by merging `dev` into `main`; never `vercel deploy --prod` from a branch or worktree.',
    )
  }
  console.log(`guard-preview-db: production build from ${PRODUCTION_REF}.`)
  process.exit(0)
}

if (!productionEndpoint) {
  refuse(
    `PRODUCTION_DB_ENDPOINT is not set for VERCEL_ENV=${vercelEnv}. Refusing to migrate an unknown database.`,
  )
}

let host = ''
try {
  host = url ? new URL(url).hostname : ''
} catch {
  host = ''
}

if (!host) {
  refuse(
    `POSTGRES_URL is missing or malformed for VERCEL_ENV=${vercelEnv}. Set the Preview-scoped POSTGRES_URL on Vercel to the Neon preview branch.`,
  )
}

if (host.startsWith(`${productionEndpoint}.`) || host.startsWith(`${productionEndpoint}-`)) {
  const remedy =
    ref === PREVIEW_REF
      ? 'Point the Preview-scoped POSTGRES_URL on Vercel at the Neon preview branch.'
      : `Only a git-triggered preview of \`${PREVIEW_REF}\` (Vercel dashboard → Create Deployment, ref ${PREVIEW_REF}) receives the Neon preview branch; a CLI \`vercel deploy\` does not. Do not deploy from the CLI.`
  refuse(
    `VERCEL_ENV=${vercelEnv} from ref ${ref} is pointed at the production Neon endpoint (${productionEndpoint}). ` +
      `This build would migrate production. Aborting. ${remedy}`,
  )
}

console.log(
  `guard-preview-db: VERCEL_ENV=${vercelEnv} from ref ${ref} is using ${host}, not production.`,
)

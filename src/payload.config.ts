// storage-adapter-import-placeholder

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { askEmbeddingsTable } from '@/features/ask/schema'
import { defaultLexical } from '@/fields/defaultLexical'
import { r2FileUrl } from '@/utilities/r2'
import { AskQuestions } from './collections/AskQuestions'
import { Capabilities } from './collections/Capabilities'
import { Categories } from './collections/Categories'
import { Clients } from './collections/Clients'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { cloudflareMediaSync } from './collections/Media/hooks/syncCloudflare'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Works } from './collections/Works'
import { agentMediaEndpoint } from './endpoints/agentMedia'
import { askEndpoints } from './endpoints/ask'
import { ContactPage } from './globals/ContactPage'
import { SiteInfo } from './globals/SiteInfo'
import { WorksIndex } from './globals/WorksIndex'
import { Header } from './Header/config'
import { askQuestionRetentionTask } from './jobs/askQuestionRetention'
import { cloudflareMediaSweepTask } from './jobs/cloudflareMediaSweep'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Drizzle push only ever targets the local Docker DB, never Neon. */
const isLocalDatabase = (url: string | undefined): boolean => {
  try {
    const { hostname } = new URL(url ?? '')
    return hostname === '127.0.0.1' || hostname === 'localhost'
  } catch {
    return false
  }
}

export default buildConfig({
  admin: {
    components: {
      // Unanswered requests first on the dashboard, and pinned above the nav,
      // so a lead from Ask cannot be missed (composer Phase 5).
      beforeDashboard: [
        '@/collections/Inquiries/components/InquiriesDashboard#InquiriesDashboard',
        '@/collections/AskQuestions/components/AskDashboard#AskDashboard',
      ],
      beforeNavLinks: ['@/collections/Inquiries/components/InboxNavBadge#InboxNavBadge'],
      beforeLogin: ['@/components/BeforeLogin'],
      // All / group filter over Payload's blocks drawer (composer roadmap,
      // Phase 3). Reads group labels from the drawer, so it needs no wiring.
      providers: ['@/components/admin/BlocksDrawerTabs#BlocksDrawerTabs'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,

    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY,
    defaultFromAddress: 'miles@milesroxas.com',
    defaultFromName: 'Miles Roxas',
  }),
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
    // Push in local dev, migrations in CI (see MIGRATIONS.md). Payload forbids
    // mixing the two on one database, so push is limited to a local URL, and
    // PAYLOAD_DB_PUSH=false opts out (the dev TUI's "dev against prod" mode).
    push: process.env.PAYLOAD_DB_PUSH !== 'false' && isLocalDatabase(process.env.POSTGRES_URL),
    beforeSchemaInit: [
      // Ask RAG embedding index (src/features/ask/schema.ts): derived data,
      // not a Payload collection. Needs the pgvector extension (the
      // ask_embeddings migration creates it; the local image ships it).
      ({ schema }) => ({
        ...schema,
        tables: {
          ...schema.tables,
          ask_embeddings: askEmbeddingsTable,
        },
      }),
    ],
  }),
  collections: [
    Pages,
    Posts,
    Works,
    Media,
    Capabilities,
    Categories,
    Clients,
    Inquiries,
    AskQuestions,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  // `agent/media`: an MCP key's image upload (docs/mcp.md).
  endpoints: [...askEndpoints, agentMediaEndpoint],
  globals: [Header, SiteInfo, ContactPage, WorksIndex],
  plugins: [
    ...plugins,
    // Cloudflare R2 is the origin for every file (docs/media.md). The admin
    // uploads straight to the bucket on a presigned PUT (`clientUploads`), so
    // a video never meets the 4.5 MB function body limit; server-side uploads
    // (`/api/agent/media`, the Local API) go through the same adapter. Media
    // reads are public, so `url` and the size URL point at the bucket's
    // custom domain (`r2FileUrl`) instead of the serverless proxy, and that
    // is the URL Cloudflare Images and Stream fetch from.
    s3Storage({
      bucket: process.env.R2_BUCKET || '',
      clientUploads: true,
      collections: {
        media: { disablePayloadAccessControl: true, generateFileURL: r2FileUrl },
      },
      config: {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
    cloudflareMediaSync(),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Team members only: an MCP API key authenticates as `req.user` too.
        if (req.user?.collection === 'users') return true

        // Vercel Cron (vercel.json) sends the secret; without one set, nothing
        // anonymous may run jobs.
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        return req.headers.get('authorization') === `Bearer ${secret}`
      },
    },
    tasks: [askQuestionRetentionTask, cloudflareMediaSweepTask],
  },
})

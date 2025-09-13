// storage-adapter-import-placeholder
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import sharp from 'sharp'
import path from 'path'
import { buildConfig, CollectionSlug, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Works } from './collections/Works'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { resendAdapter } from '@payloadcms/email-resend'
import { generatePreviewPath } from './utilities/generatePreviewPath'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  console.warn('[payload] RESEND_API_KEY is not set; email sending is disabled in this environment.')
}

// Avoid initializing the Resend adapter without an API key.
// When no key is present, some providers perform a lightweight request
// that can show up as repeated 401s in provider logs.
const emailAdapter = resendApiKey
  ? resendAdapter({
      apiKey: resendApiKey,
      defaultFromAddress: 'miles@milesroxas.com',
      defaultFromName: 'Miles Roxas',
    })
  : undefined

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,

    livePreview: {
      collections: ['pages', 'posts', 'works'],
      url: ({ collectionConfig, data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: collectionConfig?.slug as CollectionSlug,
          req,
        })
        return path
      },
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
  email: emailAdapter,
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  collections: [Pages, Posts, Works, Media, Categories, Users],
  cors: (() => {
    const origins = new Set<string>()
    const base = getServerSideURL()
    if (base) origins.add(base)

    const vercelRuntime = process.env.VERCEL_URL
    if (vercelRuntime) origins.add(`https://${vercelRuntime}`)

    if (process.env.NODE_ENV !== 'production') {
      origins.add('http://localhost:3000')
    }

    return Array.from(origins)
  })(),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    vercelBlobStorage({
      enabled: true,
      clientUploads: true,

      collections: {
        media: true,
      },

      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})

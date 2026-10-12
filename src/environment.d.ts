declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      POSTGRES_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      RESEND_API_KEY: string
      /** Cloudflare R2, the media bucket (docs/media.md). */
      R2_ACCOUNT_ID: string
      R2_ACCESS_KEY_ID: string
      R2_SECRET_ACCESS_KEY: string
      R2_BUCKET: string
      /** The bucket's public custom domain, no trailing slash. */
      R2_PUBLIC_URL: string
      CRON_SECRET: string
      PREVIEW_SECRET: string
      VERCEL_URL: string
      CLOUDFLARE_ACCOUNT_ID: string
      CLOUDFLARE_API_TOKEN: string
      CLOUDFLARE_IMAGES_ACCOUNT_HASH: string
      CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: string
      CLOUDFLARE_STREAM_WEBHOOK_SECRET: string
      WORK_ACCESS_KEYS: string
      /** Ask (src/features/ask): /api/ask answers 503 without it. */
      OPENAI_API_KEY?: string
      OPENAI_ADMIN_API_KEY?: string
      OPENAI_PROJECT_ID?: string
      TYPESAFE_API_KEY?: string
      ASK_JEV?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

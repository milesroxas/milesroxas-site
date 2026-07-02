declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      POSTGRES_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      RESEND_API_KEY: string
      BLOB_READ_WRITE_TOKEN: string
      CRON_SECRET: string
      PREVIEW_SECRET: string
      VERCEL_URL: string
      CLOUDFLARE_ACCOUNT_ID: string
      CLOUDFLARE_API_TOKEN: string
      CLOUDFLARE_IMAGES_ACCOUNT_HASH: string
      CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: string
      CLOUDFLARE_STREAM_WEBHOOK_SECRET: string
      WORK_ACCESS_KEYS: string
      BLOB_BASE_URL?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

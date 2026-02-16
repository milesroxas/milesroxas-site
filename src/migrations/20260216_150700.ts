import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Add Cloudflare Images fields to media table
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_image_id" varchar;
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_image_url" varchar;

   -- Add Cloudflare Stream fields to media table
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_uid" varchar;
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_playback_url" varchar;
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_ready" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudflare_image_id";
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudflare_image_url";
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudflare_stream_uid";
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudflare_stream_playback_url";
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudflare_stream_ready";`)
}

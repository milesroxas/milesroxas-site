import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Idempotent so it succeeds after a pg_restore from DBs that already ran 20260124 (is_protected, etc.). */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const createEnum = (name: string, values: string) => sql.raw(`
DO $$ BEGIN
  CREATE TYPE "public".${name} AS ENUM(${values});
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;`)

  await db.execute(createEnum(`"enum_pages_blocks_form_block_space_pt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_pages_blocks_form_block_space_pb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_pages_blocks_form_block_space_mt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_pages_blocks_form_block_space_mb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_pages_blocks_form_block_intro_align"`, `'left', 'center'`))
  await db.execute(createEnum(`"enum__pages_v_blocks_form_block_space_pt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__pages_v_blocks_form_block_space_pb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__pages_v_blocks_form_block_space_mt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__pages_v_blocks_form_block_space_mb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__pages_v_blocks_form_block_intro_align"`, `'left', 'center'`))
  await db.execute(createEnum(`"enum_works_blocks_form_block_space_pt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_works_blocks_form_block_space_pb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_works_blocks_form_block_space_mt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_works_blocks_form_block_space_mb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum_works_blocks_form_block_intro_align"`, `'left', 'center'`))
  await db.execute(createEnum(`"enum_works_project_status"`, `'coming-soon', 'live'`))
  await db.execute(createEnum(`"enum__works_v_blocks_form_block_space_pt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__works_v_blocks_form_block_space_pb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__works_v_blocks_form_block_space_mt"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__works_v_blocks_form_block_space_mb"`, `'none', 'sm', 'md', 'lg', 'xl'`))
  await db.execute(createEnum(`"enum__works_v_blocks_form_block_intro_align"`, `'left', 'center'`))

  await db.execute(sql.raw(`
DO $$ BEGIN
  ALTER TABLE "works" ALTER COLUMN "status" SET DATA TYPE "public"."enum_works_project_status" USING "status"::text::"public"."enum_works_project_status";
  ALTER TABLE "_works_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum_works_project_status" USING "version_status"::text::"public"."enum_works_project_status";
EXCEPTION
  WHEN others THEN null;
END $$;`))

  await db.execute(sql`
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pt" "enum_pages_blocks_form_block_space_pt" DEFAULT 'md';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pb" "enum_pages_blocks_form_block_space_pb" DEFAULT 'md';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mt" "enum_pages_blocks_form_block_space_mt" DEFAULT 'none';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mb" "enum_pages_blocks_form_block_space_mb" DEFAULT 'none';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN IF NOT EXISTS "intro_align" "enum_pages_blocks_form_block_intro_align" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pt" "enum__pages_v_blocks_form_block_space_pt" DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pb" "enum__pages_v_blocks_form_block_space_pb" DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mt" "enum__pages_v_blocks_form_block_space_mt" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mb" "enum__pages_v_blocks_form_block_space_mb" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "intro_align" "enum__pages_v_blocks_form_block_intro_align" DEFAULT 'left';
  ALTER TABLE "works_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pt" "enum_works_blocks_form_block_space_pt" DEFAULT 'md';
  ALTER TABLE "works_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pb" "enum_works_blocks_form_block_space_pb" DEFAULT 'md';
  ALTER TABLE "works_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mt" "enum_works_blocks_form_block_space_mt" DEFAULT 'none';
  ALTER TABLE "works_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mb" "enum_works_blocks_form_block_space_mb" DEFAULT 'none';
  ALTER TABLE "works_blocks_form_block" ADD COLUMN IF NOT EXISTS "intro_align" "enum_works_blocks_form_block_intro_align" DEFAULT 'left';
  ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "is_protected" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "fallback_work_id" integer;
  ALTER TABLE "_works_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pt" "enum__works_v_blocks_form_block_space_pt" DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_pb" "enum__works_v_blocks_form_block_space_pb" DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mt" "enum__works_v_blocks_form_block_space_mt" DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "space_mb" "enum__works_v_blocks_form_block_space_mb" DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_form_block" ADD COLUMN IF NOT EXISTS "intro_align" "enum__works_v_blocks_form_block_intro_align" DEFAULT 'left';
  ALTER TABLE "_works_v" ADD COLUMN IF NOT EXISTS "version_is_protected" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN IF NOT EXISTS "version_fallback_work_id" integer;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_image_id" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_image_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_uid" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_playback_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudflare_stream_ready" boolean DEFAULT false;`)

  await db.execute(sql.raw(`
DO $$ BEGIN
  ALTER TABLE "works" ADD CONSTRAINT "works_fallback_work_id_works_id_fk" FOREIGN KEY ("fallback_work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;`))

  await db.execute(sql.raw(`
DO $$ BEGIN
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_fallback_work_id_works_id_fk" FOREIGN KEY ("version_fallback_work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;`))

  await db.execute(sql`
  CREATE INDEX IF NOT EXISTS "works_fallback_work_idx" ON "works" USING btree ("fallback_work_id");
  CREATE INDEX IF NOT EXISTS "_works_v_version_version_fallback_work_idx" ON "_works_v" USING btree ("version_fallback_work_id");`)

  await db.execute(sql`
  ALTER TABLE "works" DROP COLUMN IF EXISTS "is_password_protected";
  ALTER TABLE "works" DROP COLUMN IF EXISTS "password";
  ALTER TABLE "_works_v" DROP COLUMN IF EXISTS "version_is_password_protected";
  ALTER TABLE "_works_v" DROP COLUMN IF EXISTS "version_password";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "works" DROP CONSTRAINT "works_fallback_work_id_works_id_fk";
  
  ALTER TABLE "_works_v" DROP CONSTRAINT "_works_v_version_fallback_work_id_works_id_fk";
  
  DROP INDEX "works_fallback_work_idx";
  DROP INDEX "_works_v_version_version_fallback_work_idx";
  ALTER TABLE "works" ALTER COLUMN "status" SET DATA TYPE "public"."enum_works_status" USING "status"::text::"public"."enum_works_status";
  ALTER TABLE "_works_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__works_v_version_status" USING "version_status"::text::"public"."enum__works_v_version_status";
  ALTER TABLE "works" ADD COLUMN "is_password_protected" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "password" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_is_password_protected" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version_password" varchar;
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "space_pt";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "space_pb";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "space_mt";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "space_mb";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "intro_align";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "space_pt";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "space_pb";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "space_mt";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "space_mb";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "intro_align";
  ALTER TABLE "works_blocks_form_block" DROP COLUMN "space_pt";
  ALTER TABLE "works_blocks_form_block" DROP COLUMN "space_pb";
  ALTER TABLE "works_blocks_form_block" DROP COLUMN "space_mt";
  ALTER TABLE "works_blocks_form_block" DROP COLUMN "space_mb";
  ALTER TABLE "works_blocks_form_block" DROP COLUMN "intro_align";
  ALTER TABLE "works" DROP COLUMN "is_protected";
  ALTER TABLE "works" DROP COLUMN "fallback_work_id";
  ALTER TABLE "_works_v_blocks_form_block" DROP COLUMN "space_pt";
  ALTER TABLE "_works_v_blocks_form_block" DROP COLUMN "space_pb";
  ALTER TABLE "_works_v_blocks_form_block" DROP COLUMN "space_mt";
  ALTER TABLE "_works_v_blocks_form_block" DROP COLUMN "space_mb";
  ALTER TABLE "_works_v_blocks_form_block" DROP COLUMN "intro_align";
  ALTER TABLE "_works_v" DROP COLUMN "version_is_protected";
  ALTER TABLE "_works_v" DROP COLUMN "version_fallback_work_id";
  ALTER TABLE "media" DROP COLUMN "cloudflare_image_id";
  ALTER TABLE "media" DROP COLUMN "cloudflare_image_url";
  ALTER TABLE "media" DROP COLUMN "cloudflare_stream_uid";
  ALTER TABLE "media" DROP COLUMN "cloudflare_stream_playback_url";
  ALTER TABLE "media" DROP COLUMN "cloudflare_stream_ready";
  DROP TYPE "public"."enum_pages_blocks_form_block_space_pt";
  DROP TYPE "public"."enum_pages_blocks_form_block_space_pb";
  DROP TYPE "public"."enum_pages_blocks_form_block_space_mt";
  DROP TYPE "public"."enum_pages_blocks_form_block_space_mb";
  DROP TYPE "public"."enum_pages_blocks_form_block_intro_align";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_space_pt";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_space_pb";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_space_mt";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_space_mb";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_intro_align";
  DROP TYPE "public"."enum_works_blocks_form_block_space_pt";
  DROP TYPE "public"."enum_works_blocks_form_block_space_pb";
  DROP TYPE "public"."enum_works_blocks_form_block_space_mt";
  DROP TYPE "public"."enum_works_blocks_form_block_space_mb";
  DROP TYPE "public"."enum_works_blocks_form_block_intro_align";
  DROP TYPE "public"."enum_works_project_status";
  DROP TYPE "public"."enum__works_v_blocks_form_block_space_pt";
  DROP TYPE "public"."enum__works_v_blocks_form_block_space_pb";
  DROP TYPE "public"."enum__works_v_blocks_form_block_space_mt";
  DROP TYPE "public"."enum__works_v_blocks_form_block_space_mb";
  DROP TYPE "public"."enum__works_v_blocks_form_block_intro_align";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum_works_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum_works_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "text_text_size" "enum_pages_blocks_content_columns_text_text_size" DEFAULT 'base';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "media_caption_size" "enum_pages_blocks_content_columns_media_caption_size" DEFAULT 'normal';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "media_full_width" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "text_text_size" "enum__pages_v_blocks_content_columns_text_text_size" DEFAULT 'base';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "media_caption_size" "enum__pages_v_blocks_content_columns_media_caption_size" DEFAULT 'normal';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "media_full_width" boolean DEFAULT false;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "text_text_size" "enum_works_blocks_content_columns_text_text_size" DEFAULT 'base';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "media_caption_size" "enum_works_blocks_content_columns_media_caption_size" DEFAULT 'normal';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "media_full_width" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "_order" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "text_text_size" "enum__works_v_blocks_content_columns_text_text_size" DEFAULT 'base';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "media_caption_size" "enum__works_v_blocks_content_columns_media_caption_size" DEFAULT 'normal';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "media_full_width" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version__order" varchar;
  CREATE UNIQUE INDEX IF NOT EXISTS "works__order_idx" ON "works" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_works_v_version_version__order_idx" ON "_works_v" USING btree ("version__order");
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "public"."pages_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_media_block_aspect_ratio";
  CREATE TYPE "public"."enum_pages_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  ALTER TABLE "public"."pages_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE "public"."enum_pages_blocks_media_block_aspect_ratio" USING "aspect_ratio"::"public"."enum_pages_blocks_media_block_aspect_ratio";
  ALTER TABLE "public"."_pages_v_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_media_block_aspect_ratio";
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  ALTER TABLE "public"."_pages_v_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE "public"."enum__pages_v_blocks_media_block_aspect_ratio" USING "aspect_ratio"::"public"."enum__pages_v_blocks_media_block_aspect_ratio";
  ALTER TABLE "public"."works_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_blocks_media_block_aspect_ratio";
  CREATE TYPE "public"."enum_works_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  ALTER TABLE "public"."works_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE "public"."enum_works_blocks_media_block_aspect_ratio" USING "aspect_ratio"::"public"."enum_works_blocks_media_block_aspect_ratio";
  ALTER TABLE "public"."_works_v_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE text;
  DROP TYPE "public"."enum__works_v_blocks_media_block_aspect_ratio";
  CREATE TYPE "public"."enum__works_v_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  ALTER TABLE "public"."_works_v_blocks_media_block" ALTER COLUMN "aspect_ratio" SET DATA TYPE "public"."enum__works_v_blocks_media_block_aspect_ratio" USING "aspect_ratio"::"public"."enum__works_v_blocks_media_block_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_content_columns_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_text_size";
  DROP TYPE "public"."enum_works_blocks_content_columns_text_size";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_text_size";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_works_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  ALTER TYPE "public"."enum_pages_blocks_media_block_aspect_ratio" ADD VALUE 'original';
  ALTER TYPE "public"."enum__pages_v_blocks_media_block_aspect_ratio" ADD VALUE 'original';
  ALTER TYPE "public"."enum_works_blocks_media_block_aspect_ratio" ADD VALUE 'original';
  ALTER TYPE "public"."enum__works_v_blocks_media_block_aspect_ratio" ADD VALUE 'original';
  DROP INDEX IF EXISTS "works__order_idx";
  DROP INDEX IF EXISTS "_works_v_version_version__order_idx";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "text_size" "enum_pages_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "text_size" "enum__pages_v_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "text_size" "enum_works_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "text_size" "enum__works_v_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "text_text_size";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "media_caption_size";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "media_full_width";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_text_size";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "media_caption_size";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "media_full_width";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "text_text_size";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "media_caption_size";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "media_full_width";
  ALTER TABLE "works" DROP COLUMN IF EXISTS "_order";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_text_size";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "media_caption_size";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "media_full_width";
  ALTER TABLE "_works_v" DROP COLUMN IF EXISTS "version__order";
  DROP TYPE "public"."enum_pages_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum_works_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum_works_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_media_caption_size";`)
}

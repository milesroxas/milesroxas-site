import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum_works_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  ALTER TYPE "public"."enum_pages_blocks_content_columns_content" ADD VALUE 'youTube';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_content" ADD VALUE 'youTube';
  ALTER TYPE "public"."enum_works_blocks_content_columns_content" ADD VALUE 'youTube';
  ALTER TYPE "public"."enum__works_v_blocks_content_columns_content" ADD VALUE 'youTube';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "you_tube_url" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "you_tube_aspect_ratio" "enum_pages_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "you_tube_full_width" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "you_tube_url" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "you_tube_aspect_ratio" "enum__pages_v_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "you_tube_full_width" boolean DEFAULT false;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "you_tube_url" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "you_tube_aspect_ratio" "enum_works_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "you_tube_full_width" boolean DEFAULT false;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "you_tube_url" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "you_tube_aspect_ratio" "enum__works_v_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "you_tube_full_width" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_content";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::"public"."enum_pages_blocks_content_columns_content";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE "public"."enum_pages_blocks_content_columns_content" USING "content"::"public"."enum_pages_blocks_content_columns_content";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_content";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::"public"."enum__pages_v_blocks_content_columns_content";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_content" USING "content"::"public"."enum__pages_v_blocks_content_columns_content";
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE text;
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum_works_blocks_content_columns_content";
  CREATE TYPE "public"."enum_works_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::"public"."enum_works_blocks_content_columns_content";
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE "public"."enum_works_blocks_content_columns_content" USING "content"::"public"."enum_works_blocks_content_columns_content";
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE text;
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum__works_v_blocks_content_columns_content";
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "content" SET DEFAULT 'text'::"public"."enum__works_v_blocks_content_columns_content";
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "content" SET DATA TYPE "public"."enum__works_v_blocks_content_columns_content" USING "content"::"public"."enum__works_v_blocks_content_columns_content";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "you_tube_url";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "you_tube_aspect_ratio";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "you_tube_full_width";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "you_tube_url";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "you_tube_aspect_ratio";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "you_tube_full_width";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN "you_tube_url";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN "you_tube_aspect_ratio";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN "you_tube_full_width";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN "you_tube_url";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN "you_tube_aspect_ratio";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN "you_tube_full_width";
  DROP TYPE "public"."enum_pages_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum_works_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_you_tube_aspect_ratio";`)
}

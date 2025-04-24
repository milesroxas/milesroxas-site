import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_archive_card_style" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_card_style" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_works_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_works_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum_works_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_works_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_works_blocks_archive_card_style" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__works_v_blocks_archive_card_style" AS ENUM('card', 'featured');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_tabs" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "works_blocks_tabs" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_tabs" ALTER COLUMN "space_mt" SET DEFAULT 'none';
  ALTER TABLE "_works_v_blocks_tabs" ALTER COLUMN "space_mb" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_variant" "enum_pages_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum_pages_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum_pages_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum_pages_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "card_style" "enum_pages_blocks_archive_card_style" DEFAULT 'card';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_variant" "enum__pages_v_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum__pages_v_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum__pages_v_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum__pages_v_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "card_style" "enum__pages_v_blocks_archive_card_style" DEFAULT 'card';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_variant" "enum_works_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum_works_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum_works_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum_works_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_archive" ADD COLUMN "card_style" "enum_works_blocks_archive_card_style" DEFAULT 'card';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_variant" "enum__works_v_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum__works_v_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum__works_v_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum__works_v_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_archive" ADD COLUMN "card_style" "enum__works_v_blocks_archive_card_style" DEFAULT 'card';
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_card_card_work_work_works_id_works_id_fk" FOREIGN KEY ("card_card_work_work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk" FOREIGN KEY ("card_card_post_post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_card_card_work_work_works_id_works_id_fk" FOREIGN KEY ("card_card_work_work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk" FOREIGN KEY ("card_card_post_post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "works_blocks_content_columns" ADD CONSTRAINT "works_blocks_content_columns_card_card_work_work_works_id_works_id_fk" FOREIGN KEY ("card_card_work_work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "works_blocks_content_columns" ADD CONSTRAINT "works_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk" FOREIGN KEY ("card_card_post_post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_works_v_blocks_content_columns" ADD CONSTRAINT "_works_v_blocks_content_columns_card_card_work_work_works_id_works_id_fk" FOREIGN KEY ("card_card_work_work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_works_v_blocks_content_columns" ADD CONSTRAINT "_works_v_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk" FOREIGN KEY ("card_card_post_post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx" ON "pages_blocks_content_columns" USING btree ("card_card_work_work_works_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx" ON "pages_blocks_content_columns" USING btree ("card_card_post_post_posts_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx" ON "_pages_v_blocks_content_columns" USING btree ("card_card_work_work_works_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx" ON "_pages_v_blocks_content_columns" USING btree ("card_card_post_post_posts_id");
  CREATE INDEX IF NOT EXISTS "works_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx" ON "works_blocks_content_columns" USING btree ("card_card_work_work_works_id");
  CREATE INDEX IF NOT EXISTS "works_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx" ON "works_blocks_content_columns" USING btree ("card_card_post_post_posts_id");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx" ON "_works_v_blocks_content_columns" USING btree ("card_card_work_work_works_id");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx" ON "_works_v_blocks_content_columns" USING btree ("card_card_post_post_posts_id");
  ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum_pages_blocks_content_columns_content_type" USING "content_type"::"public"."enum_pages_blocks_content_columns_content_type";
  ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_content_type" USING "content_type"::"public"."enum__pages_v_blocks_content_columns_content_type";
  ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum_works_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum_works_blocks_content_columns_content_type" USING "content_type"::"public"."enum_works_blocks_content_columns_content_type";
  ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__works_v_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum__works_v_blocks_content_columns_content_type" USING "content_type"::"public"."enum__works_v_blocks_content_columns_content_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_card_card_work_work_works_id_works_id_fk";
  
  ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_card_card_work_work_works_id_works_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk";
  
  ALTER TABLE "works_blocks_content_columns" DROP CONSTRAINT "works_blocks_content_columns_card_card_work_work_works_id_works_id_fk";
  
  ALTER TABLE "works_blocks_content_columns" DROP CONSTRAINT "works_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk";
  
  ALTER TABLE "_works_v_blocks_content_columns" DROP CONSTRAINT "_works_v_blocks_content_columns_card_card_work_work_works_id_works_id_fk";
  
  ALTER TABLE "_works_v_blocks_content_columns" DROP CONSTRAINT "_works_v_blocks_content_columns_card_card_post_post_posts_id_posts_id_fk";
  
  DROP INDEX IF EXISTS "pages_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx";
  DROP INDEX IF EXISTS "pages_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx";
  DROP INDEX IF EXISTS "_pages_v_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx";
  DROP INDEX IF EXISTS "_pages_v_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx";
  DROP INDEX IF EXISTS "works_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx";
  DROP INDEX IF EXISTS "works_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx";
  DROP INDEX IF EXISTS "_works_v_blocks_content_columns_card_card_work_work_card_card_work_work_works_idx";
  DROP INDEX IF EXISTS "_works_v_blocks_content_columns_card_card_post_post_card_card_post_post_posts_idx";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_tabs" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "works_blocks_tabs" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "slider_space_mt" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_content_columns" ALTER COLUMN "slider_space_mb" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_content" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_content" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_slider" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_slider" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_tabs" ALTER COLUMN "space_mt" SET DEFAULT 'md';
  ALTER TABLE "_works_v_blocks_tabs" ALTER COLUMN "space_mb" SET DEFAULT 'md';
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN IF EXISTS "card_style";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN IF EXISTS "card_style";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "works_blocks_archive" DROP COLUMN IF EXISTS "card_style";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "_works_v_blocks_archive" DROP COLUMN IF EXISTS "card_style";
  ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'archive', 'media', 'slider');
  ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum_pages_blocks_content_columns_content_type" USING "content_type"::"public"."enum_pages_blocks_content_columns_content_type";
  ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'archive', 'media', 'slider');
  ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_content_type" USING "content_type"::"public"."enum__pages_v_blocks_content_columns_content_type";
  ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum_works_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'archive', 'media', 'slider');
  ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum_works_blocks_content_columns_content_type" USING "content_type"::"public"."enum_works_blocks_content_columns_content_type";
  ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__works_v_blocks_content_columns_content_type";
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'archive', 'media', 'slider');
  ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "content_type" SET DATA TYPE "public"."enum__works_v_blocks_content_columns_content_type" USING "content_type"::"public"."enum__works_v_blocks_content_columns_content_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_archive_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum__pages_v_blocks_archive_card_style";
  DROP TYPE "public"."enum_works_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum_works_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum_works_blocks_archive_card_style";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum__works_v_blocks_archive_card_style";`)
}

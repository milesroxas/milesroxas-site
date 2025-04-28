import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_works_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  CREATE TYPE "public"."enum_works_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_works_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_works_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_works_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  ALTER TABLE "pages_blocks_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_works" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_works" CASCADE;
  DROP TABLE "_pages_v_blocks_works" CASCADE;
  DROP TABLE "works_blocks_works" CASCADE;
  DROP TABLE "_works_v_blocks_works" CASCADE;
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
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "content" "enum_pages_blocks_content_columns_content" DEFAULT 'text';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "work_works_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "work_aspect" "enum_pages_blocks_content_columns_work_aspect" DEFAULT 'wide';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "work_variant" "enum_pages_blocks_content_columns_work_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "post_posts_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "post_aspect" "enum_pages_blocks_content_columns_post_aspect" DEFAULT 'wide';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "post_variant" "enum_pages_blocks_content_columns_post_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "content" "enum__pages_v_blocks_content_columns_content" DEFAULT 'text';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "work_works_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "work_aspect" "enum__pages_v_blocks_content_columns_work_aspect" DEFAULT 'wide';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "work_variant" "enum__pages_v_blocks_content_columns_work_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "post_posts_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "post_aspect" "enum__pages_v_blocks_content_columns_post_aspect" DEFAULT 'wide';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "post_variant" "enum__pages_v_blocks_content_columns_post_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "content" "enum_works_blocks_content_columns_content" DEFAULT 'text';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "work_works_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "work_aspect" "enum_works_blocks_content_columns_work_aspect" DEFAULT 'wide';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "work_variant" "enum_works_blocks_content_columns_work_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "post_posts_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "post_aspect" "enum_works_blocks_content_columns_post_aspect" DEFAULT 'wide';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "post_variant" "enum_works_blocks_content_columns_post_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "content" "enum__works_v_blocks_content_columns_content" DEFAULT 'text';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "work_works_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "work_aspect" "enum__works_v_blocks_content_columns_work_aspect" DEFAULT 'wide';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "work_variant" "enum__works_v_blocks_content_columns_work_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "post_posts_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "post_aspect" "enum__works_v_blocks_content_columns_post_aspect" DEFAULT 'wide';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "post_variant" "enum__works_v_blocks_content_columns_post_variant" DEFAULT 'featured';
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "works_blocks_content_columns" ADD CONSTRAINT "works_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "works_blocks_content_columns" ADD CONSTRAINT "works_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_works_v_blocks_content_columns" ADD CONSTRAINT "_works_v_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_works_v_blocks_content_columns" ADD CONSTRAINT "_works_v_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_columns_work_work_works_idx" ON "pages_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_columns_post_post_posts_idx" ON "pages_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_columns_work_work_works_idx" ON "_pages_v_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_columns_post_post_posts_idx" ON "_pages_v_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX IF NOT EXISTS "works_blocks_content_columns_work_work_works_idx" ON "works_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX IF NOT EXISTS "works_blocks_content_columns_post_post_posts_idx" ON "works_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_content_columns_work_work_works_idx" ON "_works_v_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_content_columns_post_post_posts_idx" ON "_works_v_blocks_content_columns" USING btree ("post_posts_id");
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "content_type";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "content_type";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "content_type";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "content_type";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_entry_type";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_work_work_works_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_post_post_posts_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_heading";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_subheading";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "card_card_custom_link_text";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_archive_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "works_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_content_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_works_populate_by";
  DROP TYPE "public"."enum_pages_blocks_works_relation_to";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_content_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum__pages_v_blocks_works_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_works_relation_to";
  DROP TYPE "public"."enum_works_blocks_content_columns_content_type";
  DROP TYPE "public"."enum_works_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum_works_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum_works_blocks_works_populate_by";
  DROP TYPE "public"."enum_works_blocks_works_relation_to";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_content_type";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_card_card_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_card_card_entry_type";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_post_archive_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_works_archive_variant";
  DROP TYPE "public"."enum__works_v_blocks_works_populate_by";
  DROP TYPE "public"."enum__works_v_blocks_works_relation_to";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_works_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_works_relation_to" AS ENUM('works');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_works_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_works_relation_to" AS ENUM('works');
  CREATE TYPE "public"."enum_works_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  CREATE TYPE "public"."enum_works_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_works_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum_works_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_works_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_works_blocks_works_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_works_blocks_works_relation_to" AS ENUM('works');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_content_type" AS ENUM('text', 'sectionHeading', 'card', 'postArchive', 'worksArchive', 'media', 'slider');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_card_card_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_card_card_entry_type" AS ENUM('works', 'posts', 'custom');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_post_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_works_archive_variant" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__works_v_blocks_works_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__works_v_blocks_works_relation_to" AS ENUM('works');
  CREATE TABLE IF NOT EXISTS "pages_blocks_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_works_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_works_relation_to" DEFAULT 'works',
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_works_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_works_relation_to" DEFAULT 'works',
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "works_blocks_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_works_blocks_works_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_works_blocks_works_relation_to" DEFAULT 'works',
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_works_v_blocks_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__works_v_blocks_works_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__works_v_blocks_works_relation_to" DEFAULT 'works',
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_work_works_id_works_id_fk";
  
  ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_post_posts_id_posts_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_work_works_id_works_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_post_posts_id_posts_id_fk";
  
  ALTER TABLE "works_blocks_content_columns" DROP CONSTRAINT "works_blocks_content_columns_work_works_id_works_id_fk";
  
  ALTER TABLE "works_blocks_content_columns" DROP CONSTRAINT "works_blocks_content_columns_post_posts_id_posts_id_fk";
  
  ALTER TABLE "_works_v_blocks_content_columns" DROP CONSTRAINT "_works_v_blocks_content_columns_work_works_id_works_id_fk";
  
  ALTER TABLE "_works_v_blocks_content_columns" DROP CONSTRAINT "_works_v_blocks_content_columns_post_posts_id_posts_id_fk";
  
  DROP INDEX IF EXISTS "pages_blocks_content_columns_work_work_works_idx";
  DROP INDEX IF EXISTS "pages_blocks_content_columns_post_post_posts_idx";
  DROP INDEX IF EXISTS "_pages_v_blocks_content_columns_work_work_works_idx";
  DROP INDEX IF EXISTS "_pages_v_blocks_content_columns_post_post_posts_idx";
  DROP INDEX IF EXISTS "works_blocks_content_columns_work_work_works_idx";
  DROP INDEX IF EXISTS "works_blocks_content_columns_post_post_posts_idx";
  DROP INDEX IF EXISTS "_works_v_blocks_content_columns_work_work_works_idx";
  DROP INDEX IF EXISTS "_works_v_blocks_content_columns_post_post_posts_idx";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "content_type" "enum_pages_blocks_content_columns_content_type" DEFAULT 'text';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_variant" "enum_pages_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum_pages_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum_pages_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum_pages_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "content_type" "enum__pages_v_blocks_content_columns_content_type" DEFAULT 'text';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_variant" "enum__pages_v_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum__pages_v_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum__pages_v_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum__pages_v_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "content_type" "enum_works_blocks_content_columns_content_type" DEFAULT 'text';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_variant" "enum_works_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum_works_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum_works_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum_works_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "content_type" "enum__works_v_blocks_content_columns_content_type" DEFAULT 'text';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_variant" "enum__works_v_blocks_content_columns_card_card_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_entry_type" "enum__works_v_blocks_content_columns_card_card_entry_type" DEFAULT 'works';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_work_work_works_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_post_post_posts_id" integer;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_heading" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_subheading" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "card_card_custom_link_text" varchar;
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "post_archive_variant" "enum__works_v_blocks_content_columns_post_archive_variant" DEFAULT 'featured';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "works_archive_variant" "enum__works_v_blocks_content_columns_works_archive_variant" DEFAULT 'featured';
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_works" ADD CONSTRAINT "pages_blocks_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_works" ADD CONSTRAINT "_pages_v_blocks_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "works_blocks_works" ADD CONSTRAINT "works_blocks_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_works_v_blocks_works" ADD CONSTRAINT "_works_v_blocks_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_works_order_idx" ON "pages_blocks_works" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_works_parent_id_idx" ON "pages_blocks_works" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_works_path_idx" ON "pages_blocks_works" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_works_order_idx" ON "_pages_v_blocks_works" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_works_parent_id_idx" ON "_pages_v_blocks_works" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_works_path_idx" ON "_pages_v_blocks_works" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "works_blocks_works_order_idx" ON "works_blocks_works" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "works_blocks_works_parent_id_idx" ON "works_blocks_works" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "works_blocks_works_path_idx" ON "works_blocks_works" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_works_order_idx" ON "_works_v_blocks_works" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_works_parent_id_idx" ON "_works_v_blocks_works" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_works_v_blocks_works_path_idx" ON "_works_v_blocks_works" USING btree ("_path");
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
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "work_works_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "work_aspect";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "work_variant";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "post_posts_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "post_aspect";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "post_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_works_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_aspect";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_variant";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_posts_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_aspect";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "work_works_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "work_aspect";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "work_variant";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "post_posts_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "post_aspect";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "post_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_works_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_aspect";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "work_variant";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_posts_id";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_aspect";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "post_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_content";
  DROP TYPE "public"."enum_pages_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum_pages_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum_pages_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum_pages_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_content";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_content";
  DROP TYPE "public"."enum_works_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum_works_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum_works_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum_works_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_content";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_post_variant";`)
}

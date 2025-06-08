import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__posts_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__posts_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_version_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_works_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum_works_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_text_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TABLE IF NOT EXISTS "posts_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_posts_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE IF NOT EXISTS "_posts_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__posts_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__posts_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_hero_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "posts_hero_image_idx";
  DROP INDEX IF EXISTS "_posts_v_version_version_hero_image_idx";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "sizes" "enum_pages_blocks_content_columns_sizes" DEFAULT 'oneThird';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "text_size" "enum_pages_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "sizes" "enum__pages_v_blocks_content_columns_sizes" DEFAULT 'oneThird';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "text_size" "enum__pages_v_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "posts" ADD COLUMN "hero_type" "enum_posts_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "posts" ADD COLUMN "hero_show_content" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "posts" ADD COLUMN "hero_media_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_type" "enum__posts_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_show_content" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_media_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "sizes" "enum_works_blocks_content_columns_sizes" DEFAULT 'oneThird';
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "text_size" "enum_works_blocks_content_columns_text_size" DEFAULT 'base';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "sizes" "enum__works_v_blocks_content_columns_sizes" DEFAULT 'oneThird';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "text_size" "enum__works_v_blocks_content_columns_text_size" DEFAULT 'base';
  DO $$ BEGIN
   ALTER TABLE "posts_hero_links" ADD CONSTRAINT "posts_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_posts_v_version_hero_links" ADD CONSTRAINT "_posts_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "posts_hero_links_order_idx" ON "posts_hero_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_hero_links_parent_id_idx" ON "posts_hero_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_hero_links_order_idx" ON "_posts_v_version_hero_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_hero_links_parent_id_idx" ON "_posts_v_version_hero_links" USING btree ("_parent_id");
  DO $$ BEGIN
   ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "posts_hero_hero_media_idx" ON "posts" USING btree ("hero_media_id");
  CREATE INDEX IF NOT EXISTS "posts_rels_pages_id_idx" ON "posts_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_hero_version_hero_media_idx" ON "_posts_v" USING btree ("version_hero_media_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_rels_pages_id_idx" ON "_posts_v_rels" USING btree ("pages_id");
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "size";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "size";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "hero_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_hero_image_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "size";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum_works_blocks_content_columns_size";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_size";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_works_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__works_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  ALTER TABLE "posts_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_hero_links" CASCADE;
  DROP TABLE "_posts_v_version_hero_links" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT "posts_hero_media_id_media_id_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_pages_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_hero_media_id_media_id_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_pages_fk";
  
  DROP INDEX IF EXISTS "posts_hero_hero_media_idx";
  DROP INDEX IF EXISTS "posts_rels_pages_id_idx";
  DROP INDEX IF EXISTS "_posts_v_version_hero_version_hero_media_idx";
  DROP INDEX IF EXISTS "_posts_v_rels_pages_id_idx";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird';
  ALTER TABLE "posts" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "works_blocks_content_columns" ADD COLUMN "size" "enum_works_blocks_content_columns_size" DEFAULT 'oneThird';
  ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "size" "enum__works_v_blocks_content_columns_size" DEFAULT 'oneThird';
  DO $$ BEGIN
   ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "sizes";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "sizes";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "hero_type";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "hero_show_content";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "hero_rich_text";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "hero_media_id";
  ALTER TABLE "posts_rels" DROP COLUMN IF EXISTS "pages_id";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_hero_type";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_hero_show_content";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_hero_rich_text";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_hero_media_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN IF EXISTS "pages_id";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "sizes";
  ALTER TABLE "works_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "sizes";
  ALTER TABLE "_works_v_blocks_content_columns" DROP COLUMN IF EXISTS "text_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_sizes";
  DROP TYPE "public"."enum_pages_blocks_content_columns_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_sizes";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_text_size";
  DROP TYPE "public"."enum_posts_hero_links_link_type";
  DROP TYPE "public"."enum_posts_hero_links_link_appearance";
  DROP TYPE "public"."enum_posts_hero_type";
  DROP TYPE "public"."enum__posts_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__posts_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__posts_v_version_hero_type";
  DROP TYPE "public"."enum_works_blocks_content_columns_sizes";
  DROP TYPE "public"."enum_works_blocks_content_columns_text_size";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_sizes";
  DROP TYPE "public"."enum__works_v_blocks_content_columns_text_size";`)
}

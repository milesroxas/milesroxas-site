import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_pages_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_posts_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_works_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum_pages_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum_pages_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum_pages_blocks_carousel_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum__pages_v_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum__pages_v_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum__pages_v_blocks_carousel_split_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum_posts_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum_posts_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum_posts_blocks_carousel_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum__posts_v_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum__posts_v_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum__posts_v_blocks_carousel_split_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "works_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum_works_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum_works_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum_works_blocks_carousel_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_works_v_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_works_v_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"carousel_position" "enum__works_v_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum__works_v_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum__works_v_blocks_carousel_split_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_carousel_split_slides" ADD CONSTRAINT "pages_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_split_slides" ADD CONSTRAINT "pages_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_split" ADD CONSTRAINT "pages_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_split_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_split_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_split" ADD CONSTRAINT "_pages_v_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_split_slides" ADD CONSTRAINT "posts_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_split_slides" ADD CONSTRAINT "posts_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_split" ADD CONSTRAINT "posts_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_split_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_split_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_split" ADD CONSTRAINT "_posts_v_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel_split_slides" ADD CONSTRAINT "works_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel_split_slides" ADD CONSTRAINT "works_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel_split" ADD CONSTRAINT "works_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel_split_slides" ADD CONSTRAINT "_works_v_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel_split_slides" ADD CONSTRAINT "_works_v_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel_split" ADD CONSTRAINT "_works_v_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_carousel_split_slides_order_idx" ON "pages_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_split_slides_parent_id_idx" ON "pages_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_split_slides_media_idx" ON "pages_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "pages_blocks_carousel_split_order_idx" ON "pages_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_split_parent_id_idx" ON "pages_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_split_path_idx" ON "pages_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_split_slides_order_idx" ON "_pages_v_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_split_slides_parent_id_idx" ON "_pages_v_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_split_slides_media_idx" ON "_pages_v_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_carousel_split_order_idx" ON "_pages_v_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_split_parent_id_idx" ON "_pages_v_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_split_path_idx" ON "_pages_v_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "posts_blocks_carousel_split_slides_order_idx" ON "posts_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_split_slides_parent_id_idx" ON "posts_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_split_slides_media_idx" ON "posts_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "posts_blocks_carousel_split_order_idx" ON "posts_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_split_parent_id_idx" ON "posts_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_split_path_idx" ON "posts_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_carousel_split_slides_order_idx" ON "_posts_v_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_split_slides_parent_id_idx" ON "_posts_v_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_split_slides_media_idx" ON "_posts_v_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_carousel_split_order_idx" ON "_posts_v_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_split_parent_id_idx" ON "_posts_v_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_split_path_idx" ON "_posts_v_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "works_blocks_carousel_split_slides_order_idx" ON "works_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "works_blocks_carousel_split_slides_parent_id_idx" ON "works_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_carousel_split_slides_media_idx" ON "works_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "works_blocks_carousel_split_order_idx" ON "works_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "works_blocks_carousel_split_parent_id_idx" ON "works_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_carousel_split_path_idx" ON "works_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "_works_v_blocks_carousel_split_slides_order_idx" ON "_works_v_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_carousel_split_slides_parent_id_idx" ON "_works_v_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_carousel_split_slides_media_idx" ON "_works_v_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "_works_v_blocks_carousel_split_order_idx" ON "_works_v_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_carousel_split_parent_id_idx" ON "_works_v_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_carousel_split_path_idx" ON "_works_v_blocks_carousel_split" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "pages_blocks_carousel_split" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_split" CASCADE;
  DROP TABLE "posts_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "posts_blocks_carousel_split" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_split" CASCADE;
  DROP TABLE "works_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "works_blocks_carousel_split" CASCADE;
  DROP TABLE "_works_v_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "_works_v_blocks_carousel_split" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum_pages_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum_pages_blocks_carousel_split_theme";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_split_theme";
  DROP TYPE "public"."enum_posts_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum_posts_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum_posts_blocks_carousel_split_theme";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_split_theme";
  DROP TYPE "public"."enum_works_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum_works_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum_works_blocks_carousel_split_theme";
  DROP TYPE "public"."enum__works_v_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum__works_v_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum__works_v_blocks_carousel_split_theme";`)
}

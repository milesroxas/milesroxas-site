import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_media_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_pages_media_list_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_media_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_media_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___pages_v_media_list_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_media_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_media_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_posts_media_list_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_media_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_media_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___posts_v_media_list_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_media_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_media_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_works_media_list_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_media_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_media_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___works_v_media_list_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_media_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_media_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_media_list_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_media_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_media_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_media_list_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_media_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_media_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_media_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum_pages_media_list_text_size" DEFAULT 'small',
  	"image_position" "enum_pages_media_list_image_position" DEFAULT 'left',
  	"theme" "enum_pages_media_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_media_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_media_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum___pages_v_media_list_v_text_size" DEFAULT 'small',
  	"image_position" "enum___pages_v_media_list_v_image_position" DEFAULT 'left',
  	"theme" "enum___pages_v_media_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_media_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "posts_media_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum_posts_media_list_text_size" DEFAULT 'small',
  	"image_position" "enum_posts_media_list_image_position" DEFAULT 'left',
  	"theme" "enum_posts_media_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_media_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_media_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum___posts_v_media_list_v_text_size" DEFAULT 'small',
  	"image_position" "enum___posts_v_media_list_v_image_position" DEFAULT 'left',
  	"theme" "enum___posts_v_media_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_media_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "works_media_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum_works_media_list_text_size" DEFAULT 'small',
  	"image_position" "enum_works_media_list_image_position" DEFAULT 'left',
  	"theme" "enum_works_media_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_media_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_media_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum___works_v_media_list_v_text_size" DEFAULT 'small',
  	"image_position" "enum___works_v_media_list_v_image_position" DEFAULT 'left',
  	"theme" "enum___works_v_media_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_media_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "home_media_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum_home_media_list_text_size" DEFAULT 'small',
  	"image_position" "enum_home_media_list_image_position" DEFAULT 'left',
  	"theme" "enum_home_media_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_media_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_media_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"show_numbers" boolean DEFAULT true,
  	"text_size" "enum___home_v_media_list_v_text_size" DEFAULT 'small',
  	"image_position" "enum___home_v_media_list_v_image_position" DEFAULT 'left',
  	"theme" "enum___home_v_media_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_media_list_items" ADD CONSTRAINT "pages_media_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_list_items" ADD CONSTRAINT "pages_media_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_media_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_media_list" ADD CONSTRAINT "pages_media_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_media_list_v_items" ADD CONSTRAINT "__pages_v_media_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_list_v_items" ADD CONSTRAINT "__pages_v_media_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_media_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_media_list_v" ADD CONSTRAINT "__pages_v_media_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_media_list_items" ADD CONSTRAINT "posts_media_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_list_items" ADD CONSTRAINT "posts_media_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_media_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_media_list" ADD CONSTRAINT "posts_media_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_media_list_v_items" ADD CONSTRAINT "__posts_v_media_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_list_v_items" ADD CONSTRAINT "__posts_v_media_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_media_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_media_list_v" ADD CONSTRAINT "__posts_v_media_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_media_list_items" ADD CONSTRAINT "works_media_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_media_list_items" ADD CONSTRAINT "works_media_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_media_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_media_list" ADD CONSTRAINT "works_media_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_media_list_v_items" ADD CONSTRAINT "__works_v_media_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_media_list_v_items" ADD CONSTRAINT "__works_v_media_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_media_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_media_list_v" ADD CONSTRAINT "__works_v_media_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_media_list_items" ADD CONSTRAINT "home_media_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_list_items" ADD CONSTRAINT "home_media_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_media_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_media_list" ADD CONSTRAINT "home_media_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_media_list_v_items" ADD CONSTRAINT "__home_v_media_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_list_v_items" ADD CONSTRAINT "__home_v_media_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_media_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_media_list_v" ADD CONSTRAINT "__home_v_media_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_media_list_items_order_idx" ON "pages_media_list_items" USING btree ("_order");
  CREATE INDEX "pages_media_list_items_parent_id_idx" ON "pages_media_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_media_list_items_media_idx" ON "pages_media_list_items" USING btree ("media_id");
  CREATE INDEX "pages_media_list_order_idx" ON "pages_media_list" USING btree ("_order");
  CREATE INDEX "pages_media_list_parent_id_idx" ON "pages_media_list" USING btree ("_parent_id");
  CREATE INDEX "pages_media_list_path_idx" ON "pages_media_list" USING btree ("_path");
  CREATE INDEX "__pages_v_media_list_v_items_order_idx" ON "__pages_v_media_list_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_media_list_v_items_parent_id_idx" ON "__pages_v_media_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_media_list_v_items_media_idx" ON "__pages_v_media_list_v_items" USING btree ("media_id");
  CREATE INDEX "__pages_v_media_list_v_order_idx" ON "__pages_v_media_list_v" USING btree ("_order");
  CREATE INDEX "__pages_v_media_list_v_parent_id_idx" ON "__pages_v_media_list_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_media_list_v_path_idx" ON "__pages_v_media_list_v" USING btree ("_path");
  CREATE INDEX "posts_media_list_items_order_idx" ON "posts_media_list_items" USING btree ("_order");
  CREATE INDEX "posts_media_list_items_parent_id_idx" ON "posts_media_list_items" USING btree ("_parent_id");
  CREATE INDEX "posts_media_list_items_media_idx" ON "posts_media_list_items" USING btree ("media_id");
  CREATE INDEX "posts_media_list_order_idx" ON "posts_media_list" USING btree ("_order");
  CREATE INDEX "posts_media_list_parent_id_idx" ON "posts_media_list" USING btree ("_parent_id");
  CREATE INDEX "posts_media_list_path_idx" ON "posts_media_list" USING btree ("_path");
  CREATE INDEX "__posts_v_media_list_v_items_order_idx" ON "__posts_v_media_list_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_media_list_v_items_parent_id_idx" ON "__posts_v_media_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_media_list_v_items_media_idx" ON "__posts_v_media_list_v_items" USING btree ("media_id");
  CREATE INDEX "__posts_v_media_list_v_order_idx" ON "__posts_v_media_list_v" USING btree ("_order");
  CREATE INDEX "__posts_v_media_list_v_parent_id_idx" ON "__posts_v_media_list_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_media_list_v_path_idx" ON "__posts_v_media_list_v" USING btree ("_path");
  CREATE INDEX "works_media_list_items_order_idx" ON "works_media_list_items" USING btree ("_order");
  CREATE INDEX "works_media_list_items_parent_id_idx" ON "works_media_list_items" USING btree ("_parent_id");
  CREATE INDEX "works_media_list_items_media_idx" ON "works_media_list_items" USING btree ("media_id");
  CREATE INDEX "works_media_list_order_idx" ON "works_media_list" USING btree ("_order");
  CREATE INDEX "works_media_list_parent_id_idx" ON "works_media_list" USING btree ("_parent_id");
  CREATE INDEX "works_media_list_path_idx" ON "works_media_list" USING btree ("_path");
  CREATE INDEX "__works_v_media_list_v_items_order_idx" ON "__works_v_media_list_v_items" USING btree ("_order");
  CREATE INDEX "__works_v_media_list_v_items_parent_id_idx" ON "__works_v_media_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__works_v_media_list_v_items_media_idx" ON "__works_v_media_list_v_items" USING btree ("media_id");
  CREATE INDEX "__works_v_media_list_v_order_idx" ON "__works_v_media_list_v" USING btree ("_order");
  CREATE INDEX "__works_v_media_list_v_parent_id_idx" ON "__works_v_media_list_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_media_list_v_path_idx" ON "__works_v_media_list_v" USING btree ("_path");
  CREATE INDEX "home_media_list_items_order_idx" ON "home_media_list_items" USING btree ("_order");
  CREATE INDEX "home_media_list_items_parent_id_idx" ON "home_media_list_items" USING btree ("_parent_id");
  CREATE INDEX "home_media_list_items_media_idx" ON "home_media_list_items" USING btree ("media_id");
  CREATE INDEX "home_media_list_order_idx" ON "home_media_list" USING btree ("_order");
  CREATE INDEX "home_media_list_parent_id_idx" ON "home_media_list" USING btree ("_parent_id");
  CREATE INDEX "home_media_list_path_idx" ON "home_media_list" USING btree ("_path");
  CREATE INDEX "__home_v_media_list_v_items_order_idx" ON "__home_v_media_list_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_media_list_v_items_parent_id_idx" ON "__home_v_media_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_media_list_v_items_media_idx" ON "__home_v_media_list_v_items" USING btree ("media_id");
  CREATE INDEX "__home_v_media_list_v_order_idx" ON "__home_v_media_list_v" USING btree ("_order");
  CREATE INDEX "__home_v_media_list_v_parent_id_idx" ON "__home_v_media_list_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_media_list_v_path_idx" ON "__home_v_media_list_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_media_list_items" CASCADE;
  DROP TABLE "pages_media_list" CASCADE;
  DROP TABLE "__pages_v_media_list_v_items" CASCADE;
  DROP TABLE "__pages_v_media_list_v" CASCADE;
  DROP TABLE "posts_media_list_items" CASCADE;
  DROP TABLE "posts_media_list" CASCADE;
  DROP TABLE "__posts_v_media_list_v_items" CASCADE;
  DROP TABLE "__posts_v_media_list_v" CASCADE;
  DROP TABLE "works_media_list_items" CASCADE;
  DROP TABLE "works_media_list" CASCADE;
  DROP TABLE "__works_v_media_list_v_items" CASCADE;
  DROP TABLE "__works_v_media_list_v" CASCADE;
  DROP TABLE "home_media_list_items" CASCADE;
  DROP TABLE "home_media_list" CASCADE;
  DROP TABLE "__home_v_media_list_v_items" CASCADE;
  DROP TABLE "__home_v_media_list_v" CASCADE;
  DROP TYPE "public"."enum_pages_media_list_text_size";
  DROP TYPE "public"."enum_pages_media_list_image_position";
  DROP TYPE "public"."enum_pages_media_list_theme";
  DROP TYPE "public"."enum___pages_v_media_list_v_text_size";
  DROP TYPE "public"."enum___pages_v_media_list_v_image_position";
  DROP TYPE "public"."enum___pages_v_media_list_v_theme";
  DROP TYPE "public"."enum_posts_media_list_text_size";
  DROP TYPE "public"."enum_posts_media_list_image_position";
  DROP TYPE "public"."enum_posts_media_list_theme";
  DROP TYPE "public"."enum___posts_v_media_list_v_text_size";
  DROP TYPE "public"."enum___posts_v_media_list_v_image_position";
  DROP TYPE "public"."enum___posts_v_media_list_v_theme";
  DROP TYPE "public"."enum_works_media_list_text_size";
  DROP TYPE "public"."enum_works_media_list_image_position";
  DROP TYPE "public"."enum_works_media_list_theme";
  DROP TYPE "public"."enum___works_v_media_list_v_text_size";
  DROP TYPE "public"."enum___works_v_media_list_v_image_position";
  DROP TYPE "public"."enum___works_v_media_list_v_theme";
  DROP TYPE "public"."enum_home_media_list_text_size";
  DROP TYPE "public"."enum_home_media_list_image_position";
  DROP TYPE "public"."enum_home_media_list_theme";
  DROP TYPE "public"."enum___home_v_media_list_v_text_size";
  DROP TYPE "public"."enum___home_v_media_list_v_image_position";
  DROP TYPE "public"."enum___home_v_media_list_v_theme";`)
}

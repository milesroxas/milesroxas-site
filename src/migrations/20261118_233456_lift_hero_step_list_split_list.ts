import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_split_narrow_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum_pages_step_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_pages_step_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum___pages_v_step_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___pages_v_step_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_split_narrow_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum_posts_step_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_posts_step_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum___posts_v_step_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___posts_v_step_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_split_narrow_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum_works_step_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_works_step_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_split_narrow_v_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum___works_v_step_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___works_v_step_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_split_narrow_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum_home_step_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_step_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_content_type" AS ENUM('body', 'list');
  CREATE TYPE "public"."enum___home_v_step_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_step_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'lift';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'lift';
  CREATE TABLE "pages_split_narrow_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_step_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_step_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_size" "enum_pages_step_list_text_size" DEFAULT 'small',
  	"theme" "enum_pages_step_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_split_narrow_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_step_list_v_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_step_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_size" "enum___pages_v_step_list_v_text_size" DEFAULT 'small',
  	"theme" "enum___pages_v_step_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_split_narrow_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "posts_step_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "posts_step_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_size" "enum_posts_step_list_text_size" DEFAULT 'small',
  	"theme" "enum_posts_step_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_split_narrow_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_step_list_v_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_step_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_size" "enum___posts_v_step_list_v_text_size" DEFAULT 'small',
  	"theme" "enum___posts_v_step_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_split_narrow_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "works_step_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "works_step_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_size" "enum_works_step_list_text_size" DEFAULT 'small',
  	"theme" "enum_works_step_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_split_narrow_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_step_list_v_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_step_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_size" "enum___works_v_step_list_v_text_size" DEFAULT 'small',
  	"theme" "enum___works_v_step_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_split_narrow_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_step_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_step_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_size" "enum_home_step_list_text_size" DEFAULT 'small',
  	"theme" "enum_home_step_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_split_narrow_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_step_list_v_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_step_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_size" "enum___home_v_step_list_v_text_size" DEFAULT 'small',
  	"theme" "enum___home_v_step_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_split_narrow" ADD COLUMN "content_type" "enum_pages_split_narrow_content_type";
  ALTER TABLE "pages" ADD COLUMN "hero_lift_eyebrow" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_readout_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_first_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_first_score" numeric;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_latest_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_latest_score" numeric;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_baseline_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_lift_baseline_score" numeric;
  ALTER TABLE "__pages_v_split_narrow_v" ADD COLUMN "content_type" "enum___pages_v_split_narrow_v_content_type";
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_eyebrow" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_readout_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_first_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_first_score" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_latest_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_latest_score" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_baseline_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_lift_baseline_score" numeric;
  ALTER TABLE "posts_split_narrow" ADD COLUMN "content_type" "enum_posts_split_narrow_content_type";
  ALTER TABLE "__posts_v_split_narrow_v" ADD COLUMN "content_type" "enum___posts_v_split_narrow_v_content_type";
  ALTER TABLE "works_split_narrow" ADD COLUMN "content_type" "enum_works_split_narrow_content_type";
  ALTER TABLE "__works_v_split_narrow_v" ADD COLUMN "content_type" "enum___works_v_split_narrow_v_content_type";
  ALTER TABLE "home_split_narrow" ADD COLUMN "content_type" "enum_home_split_narrow_content_type";
  ALTER TABLE "__home_v_split_narrow_v" ADD COLUMN "content_type" "enum___home_v_split_narrow_v_content_type";
  ALTER TABLE "pages_split_narrow_items" ADD CONSTRAINT "pages_split_narrow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_split_narrow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_step_list_steps" ADD CONSTRAINT "pages_step_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_step_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_step_list" ADD CONSTRAINT "pages_step_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v_items" ADD CONSTRAINT "__pages_v_split_narrow_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_split_narrow_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_step_list_v_steps" ADD CONSTRAINT "__pages_v_step_list_v_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_step_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_step_list_v" ADD CONSTRAINT "__pages_v_step_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_split_narrow_items" ADD CONSTRAINT "posts_split_narrow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_split_narrow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_step_list_steps" ADD CONSTRAINT "posts_step_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_step_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_step_list" ADD CONSTRAINT "posts_step_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v_items" ADD CONSTRAINT "__posts_v_split_narrow_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_split_narrow_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_step_list_v_steps" ADD CONSTRAINT "__posts_v_step_list_v_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_step_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_step_list_v" ADD CONSTRAINT "__posts_v_step_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_split_narrow_items" ADD CONSTRAINT "works_split_narrow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_split_narrow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_step_list_steps" ADD CONSTRAINT "works_step_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_step_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_step_list" ADD CONSTRAINT "works_step_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v_items" ADD CONSTRAINT "__works_v_split_narrow_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_split_narrow_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_step_list_v_steps" ADD CONSTRAINT "__works_v_step_list_v_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_step_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_step_list_v" ADD CONSTRAINT "__works_v_step_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_split_narrow_items" ADD CONSTRAINT "home_split_narrow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_split_narrow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_step_list_steps" ADD CONSTRAINT "home_step_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_step_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_step_list" ADD CONSTRAINT "home_step_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v_items" ADD CONSTRAINT "__home_v_split_narrow_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_split_narrow_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_step_list_v_steps" ADD CONSTRAINT "__home_v_step_list_v_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_step_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_step_list_v" ADD CONSTRAINT "__home_v_step_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_split_narrow_items_order_idx" ON "pages_split_narrow_items" USING btree ("_order");
  CREATE INDEX "pages_split_narrow_items_parent_id_idx" ON "pages_split_narrow_items" USING btree ("_parent_id");
  CREATE INDEX "pages_step_list_steps_order_idx" ON "pages_step_list_steps" USING btree ("_order");
  CREATE INDEX "pages_step_list_steps_parent_id_idx" ON "pages_step_list_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_step_list_order_idx" ON "pages_step_list" USING btree ("_order");
  CREATE INDEX "pages_step_list_parent_id_idx" ON "pages_step_list" USING btree ("_parent_id");
  CREATE INDEX "pages_step_list_path_idx" ON "pages_step_list" USING btree ("_path");
  CREATE INDEX "__pages_v_split_narrow_v_items_order_idx" ON "__pages_v_split_narrow_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_split_narrow_v_items_parent_id_idx" ON "__pages_v_split_narrow_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_step_list_v_steps_order_idx" ON "__pages_v_step_list_v_steps" USING btree ("_order");
  CREATE INDEX "__pages_v_step_list_v_steps_parent_id_idx" ON "__pages_v_step_list_v_steps" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_step_list_v_order_idx" ON "__pages_v_step_list_v" USING btree ("_order");
  CREATE INDEX "__pages_v_step_list_v_parent_id_idx" ON "__pages_v_step_list_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_step_list_v_path_idx" ON "__pages_v_step_list_v" USING btree ("_path");
  CREATE INDEX "posts_split_narrow_items_order_idx" ON "posts_split_narrow_items" USING btree ("_order");
  CREATE INDEX "posts_split_narrow_items_parent_id_idx" ON "posts_split_narrow_items" USING btree ("_parent_id");
  CREATE INDEX "posts_step_list_steps_order_idx" ON "posts_step_list_steps" USING btree ("_order");
  CREATE INDEX "posts_step_list_steps_parent_id_idx" ON "posts_step_list_steps" USING btree ("_parent_id");
  CREATE INDEX "posts_step_list_order_idx" ON "posts_step_list" USING btree ("_order");
  CREATE INDEX "posts_step_list_parent_id_idx" ON "posts_step_list" USING btree ("_parent_id");
  CREATE INDEX "posts_step_list_path_idx" ON "posts_step_list" USING btree ("_path");
  CREATE INDEX "__posts_v_split_narrow_v_items_order_idx" ON "__posts_v_split_narrow_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_split_narrow_v_items_parent_id_idx" ON "__posts_v_split_narrow_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_step_list_v_steps_order_idx" ON "__posts_v_step_list_v_steps" USING btree ("_order");
  CREATE INDEX "__posts_v_step_list_v_steps_parent_id_idx" ON "__posts_v_step_list_v_steps" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_step_list_v_order_idx" ON "__posts_v_step_list_v" USING btree ("_order");
  CREATE INDEX "__posts_v_step_list_v_parent_id_idx" ON "__posts_v_step_list_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_step_list_v_path_idx" ON "__posts_v_step_list_v" USING btree ("_path");
  CREATE INDEX "works_split_narrow_items_order_idx" ON "works_split_narrow_items" USING btree ("_order");
  CREATE INDEX "works_split_narrow_items_parent_id_idx" ON "works_split_narrow_items" USING btree ("_parent_id");
  CREATE INDEX "works_step_list_steps_order_idx" ON "works_step_list_steps" USING btree ("_order");
  CREATE INDEX "works_step_list_steps_parent_id_idx" ON "works_step_list_steps" USING btree ("_parent_id");
  CREATE INDEX "works_step_list_order_idx" ON "works_step_list" USING btree ("_order");
  CREATE INDEX "works_step_list_parent_id_idx" ON "works_step_list" USING btree ("_parent_id");
  CREATE INDEX "works_step_list_path_idx" ON "works_step_list" USING btree ("_path");
  CREATE INDEX "__works_v_split_narrow_v_items_order_idx" ON "__works_v_split_narrow_v_items" USING btree ("_order");
  CREATE INDEX "__works_v_split_narrow_v_items_parent_id_idx" ON "__works_v_split_narrow_v_items" USING btree ("_parent_id");
  CREATE INDEX "__works_v_step_list_v_steps_order_idx" ON "__works_v_step_list_v_steps" USING btree ("_order");
  CREATE INDEX "__works_v_step_list_v_steps_parent_id_idx" ON "__works_v_step_list_v_steps" USING btree ("_parent_id");
  CREATE INDEX "__works_v_step_list_v_order_idx" ON "__works_v_step_list_v" USING btree ("_order");
  CREATE INDEX "__works_v_step_list_v_parent_id_idx" ON "__works_v_step_list_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_step_list_v_path_idx" ON "__works_v_step_list_v" USING btree ("_path");
  CREATE INDEX "home_split_narrow_items_order_idx" ON "home_split_narrow_items" USING btree ("_order");
  CREATE INDEX "home_split_narrow_items_parent_id_idx" ON "home_split_narrow_items" USING btree ("_parent_id");
  CREATE INDEX "home_step_list_steps_order_idx" ON "home_step_list_steps" USING btree ("_order");
  CREATE INDEX "home_step_list_steps_parent_id_idx" ON "home_step_list_steps" USING btree ("_parent_id");
  CREATE INDEX "home_step_list_order_idx" ON "home_step_list" USING btree ("_order");
  CREATE INDEX "home_step_list_parent_id_idx" ON "home_step_list" USING btree ("_parent_id");
  CREATE INDEX "home_step_list_path_idx" ON "home_step_list" USING btree ("_path");
  CREATE INDEX "__home_v_split_narrow_v_items_order_idx" ON "__home_v_split_narrow_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_split_narrow_v_items_parent_id_idx" ON "__home_v_split_narrow_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_step_list_v_steps_order_idx" ON "__home_v_step_list_v_steps" USING btree ("_order");
  CREATE INDEX "__home_v_step_list_v_steps_parent_id_idx" ON "__home_v_step_list_v_steps" USING btree ("_parent_id");
  CREATE INDEX "__home_v_step_list_v_order_idx" ON "__home_v_step_list_v" USING btree ("_order");
  CREATE INDEX "__home_v_step_list_v_parent_id_idx" ON "__home_v_step_list_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_step_list_v_path_idx" ON "__home_v_step_list_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_split_narrow_items" CASCADE;
  DROP TABLE "pages_step_list_steps" CASCADE;
  DROP TABLE "pages_step_list" CASCADE;
  DROP TABLE "__pages_v_split_narrow_v_items" CASCADE;
  DROP TABLE "__pages_v_step_list_v_steps" CASCADE;
  DROP TABLE "__pages_v_step_list_v" CASCADE;
  DROP TABLE "posts_split_narrow_items" CASCADE;
  DROP TABLE "posts_step_list_steps" CASCADE;
  DROP TABLE "posts_step_list" CASCADE;
  DROP TABLE "__posts_v_split_narrow_v_items" CASCADE;
  DROP TABLE "__posts_v_step_list_v_steps" CASCADE;
  DROP TABLE "__posts_v_step_list_v" CASCADE;
  DROP TABLE "works_split_narrow_items" CASCADE;
  DROP TABLE "works_step_list_steps" CASCADE;
  DROP TABLE "works_step_list" CASCADE;
  DROP TABLE "__works_v_split_narrow_v_items" CASCADE;
  DROP TABLE "__works_v_step_list_v_steps" CASCADE;
  DROP TABLE "__works_v_step_list_v" CASCADE;
  DROP TABLE "home_split_narrow_items" CASCADE;
  DROP TABLE "home_step_list_steps" CASCADE;
  DROP TABLE "home_step_list" CASCADE;
  DROP TABLE "__home_v_split_narrow_v_items" CASCADE;
  DROP TABLE "__home_v_step_list_v_steps" CASCADE;
  DROP TABLE "__home_v_step_list_v" CASCADE;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'field', 'instrument');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'field', 'instrument');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "pages_split_narrow" DROP COLUMN "content_type";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_eyebrow";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_readout_label";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_first_label";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_first_score";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_latest_label";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_latest_score";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_baseline_label";
  ALTER TABLE "pages" DROP COLUMN "hero_lift_baseline_score";
  ALTER TABLE "__pages_v_split_narrow_v" DROP COLUMN "content_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_eyebrow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_readout_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_first_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_first_score";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_latest_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_latest_score";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_baseline_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_lift_baseline_score";
  ALTER TABLE "posts_split_narrow" DROP COLUMN "content_type";
  ALTER TABLE "__posts_v_split_narrow_v" DROP COLUMN "content_type";
  ALTER TABLE "works_split_narrow" DROP COLUMN "content_type";
  ALTER TABLE "__works_v_split_narrow_v" DROP COLUMN "content_type";
  ALTER TABLE "home_split_narrow" DROP COLUMN "content_type";
  ALTER TABLE "__home_v_split_narrow_v" DROP COLUMN "content_type";
  DROP TYPE "public"."enum_pages_split_narrow_content_type";
  DROP TYPE "public"."enum_pages_step_list_text_size";
  DROP TYPE "public"."enum_pages_step_list_theme";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_content_type";
  DROP TYPE "public"."enum___pages_v_step_list_v_text_size";
  DROP TYPE "public"."enum___pages_v_step_list_v_theme";
  DROP TYPE "public"."enum_posts_split_narrow_content_type";
  DROP TYPE "public"."enum_posts_step_list_text_size";
  DROP TYPE "public"."enum_posts_step_list_theme";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_content_type";
  DROP TYPE "public"."enum___posts_v_step_list_v_text_size";
  DROP TYPE "public"."enum___posts_v_step_list_v_theme";
  DROP TYPE "public"."enum_works_split_narrow_content_type";
  DROP TYPE "public"."enum_works_step_list_text_size";
  DROP TYPE "public"."enum_works_step_list_theme";
  DROP TYPE "public"."enum___works_v_split_narrow_v_content_type";
  DROP TYPE "public"."enum___works_v_step_list_v_text_size";
  DROP TYPE "public"."enum___works_v_step_list_v_theme";
  DROP TYPE "public"."enum_home_split_narrow_content_type";
  DROP TYPE "public"."enum_home_step_list_text_size";
  DROP TYPE "public"."enum_home_step_list_theme";
  DROP TYPE "public"."enum___home_v_split_narrow_v_content_type";
  DROP TYPE "public"."enum___home_v_step_list_v_text_size";
  DROP TYPE "public"."enum___home_v_step_list_v_theme";`)
}

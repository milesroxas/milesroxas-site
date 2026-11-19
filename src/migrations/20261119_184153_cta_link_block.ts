import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_cta_link_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum_pages_cta_link_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum_pages_cta_link_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_cta_link_v_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum___pages_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum___pages_v_cta_link_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_cta_link_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum_posts_cta_link_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum_posts_cta_link_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_cta_link_v_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum___posts_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum___posts_v_cta_link_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_cta_link_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum_works_cta_link_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum_works_cta_link_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_cta_link_v_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum___works_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum___works_v_cta_link_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_cta_link_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum_home_cta_link_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum_home_cta_link_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_cta_link_v_variant" AS ENUM('instrument', 'field', 'strip');
  CREATE TYPE "public"."enum___home_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  CREATE TYPE "public"."enum___home_v_cta_link_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_cta_link_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_cta_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_cta_link_variant",
  	"target_type" "enum_pages_cta_link_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum_pages_cta_link_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_cta_link_v_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_cta_link_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___pages_v_cta_link_v_variant",
  	"target_type" "enum___pages_v_cta_link_v_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum___pages_v_cta_link_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_cta_link_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "posts_cta_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_cta_link_variant",
  	"target_type" "enum_posts_cta_link_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum_posts_cta_link_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_cta_link_v_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_cta_link_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___posts_v_cta_link_v_variant",
  	"target_type" "enum___posts_v_cta_link_v_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum___posts_v_cta_link_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_cta_link_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "works_cta_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_works_cta_link_variant",
  	"target_type" "enum_works_cta_link_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum_works_cta_link_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_cta_link_v_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_cta_link_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___works_v_cta_link_v_variant",
  	"target_type" "enum___works_v_cta_link_v_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum___works_v_cta_link_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_cta_link_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "home_cta_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_home_cta_link_variant",
  	"target_type" "enum_home_cta_link_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum_home_cta_link_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_cta_link_v_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_cta_link_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___home_v_cta_link_v_variant",
  	"target_type" "enum___home_v_cta_link_v_target_type",
  	"work_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"action" varchar,
  	"theme" "enum___home_v_cta_link_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_cta_link_facts" ADD CONSTRAINT "pages_cta_link_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_cta_link"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v_facts" ADD CONSTRAINT "__pages_v_cta_link_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_cta_link_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_cta_link_facts" ADD CONSTRAINT "posts_cta_link_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_cta_link"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v_facts" ADD CONSTRAINT "__posts_v_cta_link_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_cta_link_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_cta_link_facts" ADD CONSTRAINT "works_cta_link_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_cta_link"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v_facts" ADD CONSTRAINT "__works_v_cta_link_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_cta_link_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_cta_link_facts" ADD CONSTRAINT "home_cta_link_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_cta_link"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v_facts" ADD CONSTRAINT "__home_v_cta_link_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_cta_link_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_cta_link_facts_order_idx" ON "pages_cta_link_facts" USING btree ("_order");
  CREATE INDEX "pages_cta_link_facts_parent_id_idx" ON "pages_cta_link_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_cta_link_order_idx" ON "pages_cta_link" USING btree ("_order");
  CREATE INDEX "pages_cta_link_parent_id_idx" ON "pages_cta_link" USING btree ("_parent_id");
  CREATE INDEX "pages_cta_link_path_idx" ON "pages_cta_link" USING btree ("_path");
  CREATE INDEX "pages_cta_link_work_idx" ON "pages_cta_link" USING btree ("work_id");
  CREATE INDEX "pages_cta_link_post_idx" ON "pages_cta_link" USING btree ("post_id");
  CREATE INDEX "pages_cta_link_image_idx" ON "pages_cta_link" USING btree ("image_id");
  CREATE INDEX "__pages_v_cta_link_v_facts_order_idx" ON "__pages_v_cta_link_v_facts" USING btree ("_order");
  CREATE INDEX "__pages_v_cta_link_v_facts_parent_id_idx" ON "__pages_v_cta_link_v_facts" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_cta_link_v_order_idx" ON "__pages_v_cta_link_v" USING btree ("_order");
  CREATE INDEX "__pages_v_cta_link_v_parent_id_idx" ON "__pages_v_cta_link_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_cta_link_v_path_idx" ON "__pages_v_cta_link_v" USING btree ("_path");
  CREATE INDEX "__pages_v_cta_link_v_work_idx" ON "__pages_v_cta_link_v" USING btree ("work_id");
  CREATE INDEX "__pages_v_cta_link_v_post_idx" ON "__pages_v_cta_link_v" USING btree ("post_id");
  CREATE INDEX "__pages_v_cta_link_v_image_idx" ON "__pages_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "posts_cta_link_facts_order_idx" ON "posts_cta_link_facts" USING btree ("_order");
  CREATE INDEX "posts_cta_link_facts_parent_id_idx" ON "posts_cta_link_facts" USING btree ("_parent_id");
  CREATE INDEX "posts_cta_link_order_idx" ON "posts_cta_link" USING btree ("_order");
  CREATE INDEX "posts_cta_link_parent_id_idx" ON "posts_cta_link" USING btree ("_parent_id");
  CREATE INDEX "posts_cta_link_path_idx" ON "posts_cta_link" USING btree ("_path");
  CREATE INDEX "posts_cta_link_work_idx" ON "posts_cta_link" USING btree ("work_id");
  CREATE INDEX "posts_cta_link_post_idx" ON "posts_cta_link" USING btree ("post_id");
  CREATE INDEX "posts_cta_link_image_idx" ON "posts_cta_link" USING btree ("image_id");
  CREATE INDEX "__posts_v_cta_link_v_facts_order_idx" ON "__posts_v_cta_link_v_facts" USING btree ("_order");
  CREATE INDEX "__posts_v_cta_link_v_facts_parent_id_idx" ON "__posts_v_cta_link_v_facts" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_cta_link_v_order_idx" ON "__posts_v_cta_link_v" USING btree ("_order");
  CREATE INDEX "__posts_v_cta_link_v_parent_id_idx" ON "__posts_v_cta_link_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_cta_link_v_path_idx" ON "__posts_v_cta_link_v" USING btree ("_path");
  CREATE INDEX "__posts_v_cta_link_v_work_idx" ON "__posts_v_cta_link_v" USING btree ("work_id");
  CREATE INDEX "__posts_v_cta_link_v_post_idx" ON "__posts_v_cta_link_v" USING btree ("post_id");
  CREATE INDEX "__posts_v_cta_link_v_image_idx" ON "__posts_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "works_cta_link_facts_order_idx" ON "works_cta_link_facts" USING btree ("_order");
  CREATE INDEX "works_cta_link_facts_parent_id_idx" ON "works_cta_link_facts" USING btree ("_parent_id");
  CREATE INDEX "works_cta_link_order_idx" ON "works_cta_link" USING btree ("_order");
  CREATE INDEX "works_cta_link_parent_id_idx" ON "works_cta_link" USING btree ("_parent_id");
  CREATE INDEX "works_cta_link_path_idx" ON "works_cta_link" USING btree ("_path");
  CREATE INDEX "works_cta_link_work_idx" ON "works_cta_link" USING btree ("work_id");
  CREATE INDEX "works_cta_link_post_idx" ON "works_cta_link" USING btree ("post_id");
  CREATE INDEX "works_cta_link_image_idx" ON "works_cta_link" USING btree ("image_id");
  CREATE INDEX "__works_v_cta_link_v_facts_order_idx" ON "__works_v_cta_link_v_facts" USING btree ("_order");
  CREATE INDEX "__works_v_cta_link_v_facts_parent_id_idx" ON "__works_v_cta_link_v_facts" USING btree ("_parent_id");
  CREATE INDEX "__works_v_cta_link_v_order_idx" ON "__works_v_cta_link_v" USING btree ("_order");
  CREATE INDEX "__works_v_cta_link_v_parent_id_idx" ON "__works_v_cta_link_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_cta_link_v_path_idx" ON "__works_v_cta_link_v" USING btree ("_path");
  CREATE INDEX "__works_v_cta_link_v_work_idx" ON "__works_v_cta_link_v" USING btree ("work_id");
  CREATE INDEX "__works_v_cta_link_v_post_idx" ON "__works_v_cta_link_v" USING btree ("post_id");
  CREATE INDEX "__works_v_cta_link_v_image_idx" ON "__works_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "home_cta_link_facts_order_idx" ON "home_cta_link_facts" USING btree ("_order");
  CREATE INDEX "home_cta_link_facts_parent_id_idx" ON "home_cta_link_facts" USING btree ("_parent_id");
  CREATE INDEX "home_cta_link_order_idx" ON "home_cta_link" USING btree ("_order");
  CREATE INDEX "home_cta_link_parent_id_idx" ON "home_cta_link" USING btree ("_parent_id");
  CREATE INDEX "home_cta_link_path_idx" ON "home_cta_link" USING btree ("_path");
  CREATE INDEX "home_cta_link_work_idx" ON "home_cta_link" USING btree ("work_id");
  CREATE INDEX "home_cta_link_post_idx" ON "home_cta_link" USING btree ("post_id");
  CREATE INDEX "home_cta_link_image_idx" ON "home_cta_link" USING btree ("image_id");
  CREATE INDEX "__home_v_cta_link_v_facts_order_idx" ON "__home_v_cta_link_v_facts" USING btree ("_order");
  CREATE INDEX "__home_v_cta_link_v_facts_parent_id_idx" ON "__home_v_cta_link_v_facts" USING btree ("_parent_id");
  CREATE INDEX "__home_v_cta_link_v_order_idx" ON "__home_v_cta_link_v" USING btree ("_order");
  CREATE INDEX "__home_v_cta_link_v_parent_id_idx" ON "__home_v_cta_link_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_cta_link_v_path_idx" ON "__home_v_cta_link_v" USING btree ("_path");
  CREATE INDEX "__home_v_cta_link_v_work_idx" ON "__home_v_cta_link_v" USING btree ("work_id");
  CREATE INDEX "__home_v_cta_link_v_post_idx" ON "__home_v_cta_link_v" USING btree ("post_id");
  CREATE INDEX "__home_v_cta_link_v_image_idx" ON "__home_v_cta_link_v" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_cta_link_facts" CASCADE;
  DROP TABLE "pages_cta_link" CASCADE;
  DROP TABLE "__pages_v_cta_link_v_facts" CASCADE;
  DROP TABLE "__pages_v_cta_link_v" CASCADE;
  DROP TABLE "posts_cta_link_facts" CASCADE;
  DROP TABLE "posts_cta_link" CASCADE;
  DROP TABLE "__posts_v_cta_link_v_facts" CASCADE;
  DROP TABLE "__posts_v_cta_link_v" CASCADE;
  DROP TABLE "works_cta_link_facts" CASCADE;
  DROP TABLE "works_cta_link" CASCADE;
  DROP TABLE "__works_v_cta_link_v_facts" CASCADE;
  DROP TABLE "__works_v_cta_link_v" CASCADE;
  DROP TABLE "home_cta_link_facts" CASCADE;
  DROP TABLE "home_cta_link" CASCADE;
  DROP TABLE "__home_v_cta_link_v_facts" CASCADE;
  DROP TABLE "__home_v_cta_link_v" CASCADE;
  DROP TYPE "public"."enum_pages_cta_link_variant";
  DROP TYPE "public"."enum_pages_cta_link_target_type";
  DROP TYPE "public"."enum_pages_cta_link_theme";
  DROP TYPE "public"."enum___pages_v_cta_link_v_variant";
  DROP TYPE "public"."enum___pages_v_cta_link_v_target_type";
  DROP TYPE "public"."enum___pages_v_cta_link_v_theme";
  DROP TYPE "public"."enum_posts_cta_link_variant";
  DROP TYPE "public"."enum_posts_cta_link_target_type";
  DROP TYPE "public"."enum_posts_cta_link_theme";
  DROP TYPE "public"."enum___posts_v_cta_link_v_variant";
  DROP TYPE "public"."enum___posts_v_cta_link_v_target_type";
  DROP TYPE "public"."enum___posts_v_cta_link_v_theme";
  DROP TYPE "public"."enum_works_cta_link_variant";
  DROP TYPE "public"."enum_works_cta_link_target_type";
  DROP TYPE "public"."enum_works_cta_link_theme";
  DROP TYPE "public"."enum___works_v_cta_link_v_variant";
  DROP TYPE "public"."enum___works_v_cta_link_v_target_type";
  DROP TYPE "public"."enum___works_v_cta_link_v_theme";
  DROP TYPE "public"."enum_home_cta_link_variant";
  DROP TYPE "public"."enum_home_cta_link_target_type";
  DROP TYPE "public"."enum_home_cta_link_theme";
  DROP TYPE "public"."enum___home_v_cta_link_v_variant";
  DROP TYPE "public"."enum___home_v_cta_link_v_target_type";
  DROP TYPE "public"."enum___home_v_cta_link_v_theme";`)
}

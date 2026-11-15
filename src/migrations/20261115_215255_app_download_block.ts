import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_app_dl_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum_pages_app_dl_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_pages_app_dl_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_app_dl_v_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum___pages_v_app_dl_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___pages_v_app_dl_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_app_dl_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum_posts_app_dl_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_posts_app_dl_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_app_dl_v_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum___posts_v_app_dl_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___posts_v_app_dl_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_app_dl_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum_works_app_dl_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_works_app_dl_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_app_dl_v_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum___works_v_app_dl_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___works_v_app_dl_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_app_dl_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum_home_app_dl_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_app_dl_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_app_dl_v_mode" AS ENUM('download', 'repo');
  CREATE TYPE "public"."enum___home_v_app_dl_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_app_dl_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_app_dl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum_pages_app_dl_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum_pages_app_dl_text_size" DEFAULT 'small',
  	"theme" "enum_pages_app_dl_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_app_dl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum___pages_v_app_dl_v_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum___pages_v_app_dl_v_text_size" DEFAULT 'small',
  	"theme" "enum___pages_v_app_dl_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_app_dl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum_posts_app_dl_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum_posts_app_dl_text_size" DEFAULT 'small',
  	"theme" "enum_posts_app_dl_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_app_dl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum___posts_v_app_dl_v_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum___posts_v_app_dl_v_text_size" DEFAULT 'small',
  	"theme" "enum___posts_v_app_dl_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_app_dl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum_works_app_dl_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum_works_app_dl_text_size" DEFAULT 'small',
  	"theme" "enum_works_app_dl_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_app_dl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum___works_v_app_dl_v_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum___works_v_app_dl_v_text_size" DEFAULT 'small',
  	"theme" "enum___works_v_app_dl_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_app_dl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum_home_app_dl_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum_home_app_dl_text_size" DEFAULT 'small',
  	"theme" "enum_home_app_dl_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_app_dl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"mode" "enum___home_v_app_dl_v_mode",
  	"version" varchar,
  	"mac_apple_silicon_url" varchar,
  	"mac_apple_silicon_size" varchar,
  	"mac_intel_url" varchar,
  	"mac_intel_size" varchar,
  	"mac_note" varchar,
  	"windows_url" varchar,
  	"windows_size" varchar,
  	"windows_note" varchar,
  	"linux_url" varchar,
  	"linux_size" varchar,
  	"linux_note" varchar,
  	"releases_url" varchar,
  	"repo_url" varchar,
  	"show_clone" boolean DEFAULT true,
  	"text_size" "enum___home_v_app_dl_v_text_size" DEFAULT 'small',
  	"theme" "enum___home_v_app_dl_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_app_dl" ADD CONSTRAINT "pages_app_dl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_app_dl_v" ADD CONSTRAINT "__pages_v_app_dl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_app_dl" ADD CONSTRAINT "posts_app_dl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_app_dl_v" ADD CONSTRAINT "__posts_v_app_dl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_app_dl" ADD CONSTRAINT "works_app_dl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_app_dl_v" ADD CONSTRAINT "__works_v_app_dl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_app_dl" ADD CONSTRAINT "home_app_dl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_app_dl_v" ADD CONSTRAINT "__home_v_app_dl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_app_dl_order_idx" ON "pages_app_dl" USING btree ("_order");
  CREATE INDEX "pages_app_dl_parent_id_idx" ON "pages_app_dl" USING btree ("_parent_id");
  CREATE INDEX "pages_app_dl_path_idx" ON "pages_app_dl" USING btree ("_path");
  CREATE INDEX "__pages_v_app_dl_v_order_idx" ON "__pages_v_app_dl_v" USING btree ("_order");
  CREATE INDEX "__pages_v_app_dl_v_parent_id_idx" ON "__pages_v_app_dl_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_app_dl_v_path_idx" ON "__pages_v_app_dl_v" USING btree ("_path");
  CREATE INDEX "posts_app_dl_order_idx" ON "posts_app_dl" USING btree ("_order");
  CREATE INDEX "posts_app_dl_parent_id_idx" ON "posts_app_dl" USING btree ("_parent_id");
  CREATE INDEX "posts_app_dl_path_idx" ON "posts_app_dl" USING btree ("_path");
  CREATE INDEX "__posts_v_app_dl_v_order_idx" ON "__posts_v_app_dl_v" USING btree ("_order");
  CREATE INDEX "__posts_v_app_dl_v_parent_id_idx" ON "__posts_v_app_dl_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_app_dl_v_path_idx" ON "__posts_v_app_dl_v" USING btree ("_path");
  CREATE INDEX "works_app_dl_order_idx" ON "works_app_dl" USING btree ("_order");
  CREATE INDEX "works_app_dl_parent_id_idx" ON "works_app_dl" USING btree ("_parent_id");
  CREATE INDEX "works_app_dl_path_idx" ON "works_app_dl" USING btree ("_path");
  CREATE INDEX "__works_v_app_dl_v_order_idx" ON "__works_v_app_dl_v" USING btree ("_order");
  CREATE INDEX "__works_v_app_dl_v_parent_id_idx" ON "__works_v_app_dl_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_app_dl_v_path_idx" ON "__works_v_app_dl_v" USING btree ("_path");
  CREATE INDEX "home_app_dl_order_idx" ON "home_app_dl" USING btree ("_order");
  CREATE INDEX "home_app_dl_parent_id_idx" ON "home_app_dl" USING btree ("_parent_id");
  CREATE INDEX "home_app_dl_path_idx" ON "home_app_dl" USING btree ("_path");
  CREATE INDEX "__home_v_app_dl_v_order_idx" ON "__home_v_app_dl_v" USING btree ("_order");
  CREATE INDEX "__home_v_app_dl_v_parent_id_idx" ON "__home_v_app_dl_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_app_dl_v_path_idx" ON "__home_v_app_dl_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_app_dl" CASCADE;
  DROP TABLE "__pages_v_app_dl_v" CASCADE;
  DROP TABLE "posts_app_dl" CASCADE;
  DROP TABLE "__posts_v_app_dl_v" CASCADE;
  DROP TABLE "works_app_dl" CASCADE;
  DROP TABLE "__works_v_app_dl_v" CASCADE;
  DROP TABLE "home_app_dl" CASCADE;
  DROP TABLE "__home_v_app_dl_v" CASCADE;
  DROP TYPE "public"."enum_pages_app_dl_mode";
  DROP TYPE "public"."enum_pages_app_dl_text_size";
  DROP TYPE "public"."enum_pages_app_dl_theme";
  DROP TYPE "public"."enum___pages_v_app_dl_v_mode";
  DROP TYPE "public"."enum___pages_v_app_dl_v_text_size";
  DROP TYPE "public"."enum___pages_v_app_dl_v_theme";
  DROP TYPE "public"."enum_posts_app_dl_mode";
  DROP TYPE "public"."enum_posts_app_dl_text_size";
  DROP TYPE "public"."enum_posts_app_dl_theme";
  DROP TYPE "public"."enum___posts_v_app_dl_v_mode";
  DROP TYPE "public"."enum___posts_v_app_dl_v_text_size";
  DROP TYPE "public"."enum___posts_v_app_dl_v_theme";
  DROP TYPE "public"."enum_works_app_dl_mode";
  DROP TYPE "public"."enum_works_app_dl_text_size";
  DROP TYPE "public"."enum_works_app_dl_theme";
  DROP TYPE "public"."enum___works_v_app_dl_v_mode";
  DROP TYPE "public"."enum___works_v_app_dl_v_text_size";
  DROP TYPE "public"."enum___works_v_app_dl_v_theme";
  DROP TYPE "public"."enum_home_app_dl_mode";
  DROP TYPE "public"."enum_home_app_dl_text_size";
  DROP TYPE "public"."enum_home_app_dl_theme";
  DROP TYPE "public"."enum___home_v_app_dl_v_mode";
  DROP TYPE "public"."enum___home_v_app_dl_v_text_size";
  DROP TYPE "public"."enum___home_v_app_dl_v_theme";`)
}

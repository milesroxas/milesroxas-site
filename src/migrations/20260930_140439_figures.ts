import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___posts_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___posts_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_works_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_works_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___works_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___works_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_posts_chart_width" DEFAULT 'wide',
  	"theme" "enum_posts_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_posts_diagram_width" DEFAULT 'wide',
  	"theme" "enum_posts_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___posts_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___posts_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___posts_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___posts_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_works_chart_width" DEFAULT 'wide',
  	"theme" "enum_works_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_works_diagram_width" DEFAULT 'wide',
  	"theme" "enum_works_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___works_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___works_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___works_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___works_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_chart" ADD CONSTRAINT "pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_diagram" ADD CONSTRAINT "pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_chart_v" ADD CONSTRAINT "__pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_diagram_v" ADD CONSTRAINT "__pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_chart" ADD CONSTRAINT "posts_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_diagram" ADD CONSTRAINT "posts_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_chart_v" ADD CONSTRAINT "__posts_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_diagram_v" ADD CONSTRAINT "__posts_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_chart" ADD CONSTRAINT "works_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_diagram" ADD CONSTRAINT "works_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_chart_v" ADD CONSTRAINT "__works_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_diagram_v" ADD CONSTRAINT "__works_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_chart_order_idx" ON "pages_chart" USING btree ("_order");
  CREATE INDEX "pages_chart_parent_id_idx" ON "pages_chart" USING btree ("_parent_id");
  CREATE INDEX "pages_chart_path_idx" ON "pages_chart" USING btree ("_path");
  CREATE INDEX "pages_diagram_order_idx" ON "pages_diagram" USING btree ("_order");
  CREATE INDEX "pages_diagram_parent_id_idx" ON "pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "pages_diagram_path_idx" ON "pages_diagram" USING btree ("_path");
  CREATE INDEX "__pages_v_chart_v_order_idx" ON "__pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__pages_v_chart_v_parent_id_idx" ON "__pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_chart_v_path_idx" ON "__pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__pages_v_diagram_v_order_idx" ON "__pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__pages_v_diagram_v_parent_id_idx" ON "__pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_diagram_v_path_idx" ON "__pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "posts_chart_order_idx" ON "posts_chart" USING btree ("_order");
  CREATE INDEX "posts_chart_parent_id_idx" ON "posts_chart" USING btree ("_parent_id");
  CREATE INDEX "posts_chart_path_idx" ON "posts_chart" USING btree ("_path");
  CREATE INDEX "posts_diagram_order_idx" ON "posts_diagram" USING btree ("_order");
  CREATE INDEX "posts_diagram_parent_id_idx" ON "posts_diagram" USING btree ("_parent_id");
  CREATE INDEX "posts_diagram_path_idx" ON "posts_diagram" USING btree ("_path");
  CREATE INDEX "__posts_v_chart_v_order_idx" ON "__posts_v_chart_v" USING btree ("_order");
  CREATE INDEX "__posts_v_chart_v_parent_id_idx" ON "__posts_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_chart_v_path_idx" ON "__posts_v_chart_v" USING btree ("_path");
  CREATE INDEX "__posts_v_diagram_v_order_idx" ON "__posts_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__posts_v_diagram_v_parent_id_idx" ON "__posts_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_diagram_v_path_idx" ON "__posts_v_diagram_v" USING btree ("_path");
  CREATE INDEX "works_chart_order_idx" ON "works_chart" USING btree ("_order");
  CREATE INDEX "works_chart_parent_id_idx" ON "works_chart" USING btree ("_parent_id");
  CREATE INDEX "works_chart_path_idx" ON "works_chart" USING btree ("_path");
  CREATE INDEX "works_diagram_order_idx" ON "works_diagram" USING btree ("_order");
  CREATE INDEX "works_diagram_parent_id_idx" ON "works_diagram" USING btree ("_parent_id");
  CREATE INDEX "works_diagram_path_idx" ON "works_diagram" USING btree ("_path");
  CREATE INDEX "__works_v_chart_v_order_idx" ON "__works_v_chart_v" USING btree ("_order");
  CREATE INDEX "__works_v_chart_v_parent_id_idx" ON "__works_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_chart_v_path_idx" ON "__works_v_chart_v" USING btree ("_path");
  CREATE INDEX "__works_v_diagram_v_order_idx" ON "__works_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__works_v_diagram_v_parent_id_idx" ON "__works_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_diagram_v_path_idx" ON "__works_v_diagram_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_chart" CASCADE;
  DROP TABLE "pages_diagram" CASCADE;
  DROP TABLE "__pages_v_chart_v" CASCADE;
  DROP TABLE "__pages_v_diagram_v" CASCADE;
  DROP TABLE "posts_chart" CASCADE;
  DROP TABLE "posts_diagram" CASCADE;
  DROP TABLE "__posts_v_chart_v" CASCADE;
  DROP TABLE "__posts_v_diagram_v" CASCADE;
  DROP TABLE "works_chart" CASCADE;
  DROP TABLE "works_diagram" CASCADE;
  DROP TABLE "__works_v_chart_v" CASCADE;
  DROP TABLE "__works_v_diagram_v" CASCADE;
  DROP TYPE "public"."enum_pages_chart_width";
  DROP TYPE "public"."enum_pages_chart_theme";
  DROP TYPE "public"."enum_pages_diagram_width";
  DROP TYPE "public"."enum_pages_diagram_theme";
  DROP TYPE "public"."enum___pages_v_chart_v_width";
  DROP TYPE "public"."enum___pages_v_chart_v_theme";
  DROP TYPE "public"."enum___pages_v_diagram_v_width";
  DROP TYPE "public"."enum___pages_v_diagram_v_theme";
  DROP TYPE "public"."enum_posts_chart_width";
  DROP TYPE "public"."enum_posts_chart_theme";
  DROP TYPE "public"."enum_posts_diagram_width";
  DROP TYPE "public"."enum_posts_diagram_theme";
  DROP TYPE "public"."enum___posts_v_chart_v_width";
  DROP TYPE "public"."enum___posts_v_chart_v_theme";
  DROP TYPE "public"."enum___posts_v_diagram_v_width";
  DROP TYPE "public"."enum___posts_v_diagram_v_theme";
  DROP TYPE "public"."enum_works_chart_width";
  DROP TYPE "public"."enum_works_chart_theme";
  DROP TYPE "public"."enum_works_diagram_width";
  DROP TYPE "public"."enum_works_diagram_theme";
  DROP TYPE "public"."enum___works_v_chart_v_width";
  DROP TYPE "public"."enum___works_v_chart_v_theme";
  DROP TYPE "public"."enum___works_v_diagram_v_width";
  DROP TYPE "public"."enum___works_v_diagram_v_theme";`)
}

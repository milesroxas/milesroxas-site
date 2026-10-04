import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Works get one hero (src/heros/WorkHero): the shared hero's type, content
 * toggle, links and effect slot leave the works tables, and `hero.media` and
 * `hero.richText` keep their columns. `client` is new, and `capabilities`, a
 * text list, replaces the free-text `deliverables`.
 *
 * Each `deliverables` value is split on commas and slashes into capabilities,
 * in order ("Brand Expansion / Website" -> Brand Expansion, Website), for
 * every work and every version, before the column is dropped. `down` joins
 * them back with ", ", so a slash comes back as a comma. The dropped hero
 * fields held no content in production (every link list empty, every effect
 * unset); `down` restores them at their defaults, and a work with media as a
 * High Impact hero, which every such work was.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "works_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_works_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "works_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "works_hero_links" CASCADE;
  DROP TABLE "_works_v_version_hero_links" CASCADE;
  ALTER TABLE "works" DROP CONSTRAINT "works_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "works" DROP CONSTRAINT "works_hero_shader_poster_media_id_media_id_fk";
  
  ALTER TABLE "_works_v" DROP CONSTRAINT "_works_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_works_v" DROP CONSTRAINT "_works_v_version_hero_shader_poster_media_id_media_id_fk";
  
  DROP INDEX "works_hero_shader_hero_shader_studio_idx";
  DROP INDEX "works_hero_shader_hero_shader_poster_media_idx";
  DROP INDEX "_works_v_version_hero_shader_version_hero_shader_studio_idx";
  DROP INDEX "_works_v_version_hero_shader_version_hero_shader_poster__idx";
  ALTER TABLE "works" ADD COLUMN "client" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_client" varchar;
  ALTER TABLE "works_texts" ADD CONSTRAINT "works_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_texts" ADD CONSTRAINT "_works_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "works_texts_order_parent" ON "works_texts" USING btree ("order","parent_id");
  CREATE INDEX "_works_v_texts_order_parent" ON "_works_v_texts" USING btree ("order","parent_id");
  INSERT INTO "works_texts" ("order", "parent_id", "path", "text")
    SELECT row_number() OVER (PARTITION BY w."id" ORDER BY t.ord), w."id", 'capabilities', btrim(t.item)
    FROM "works" w
    CROSS JOIN LATERAL regexp_split_to_table(w."deliverables", '[[:space:]]*[,/][[:space:]]*') WITH ORDINALITY AS t(item, ord)
    WHERE btrim(t.item) <> '';
  INSERT INTO "_works_v_texts" ("order", "parent_id", "path", "text")
    SELECT row_number() OVER (PARTITION BY v."id" ORDER BY t.ord), v."id", 'version.capabilities', btrim(t.item)
    FROM "_works_v" v
    CROSS JOIN LATERAL regexp_split_to_table(v."version_deliverables", '[[:space:]]*[,/][[:space:]]*') WITH ORDINALITY AS t(item, ord)
    WHERE btrim(t.item) <> '';
  ALTER TABLE "works" DROP COLUMN "hero_type";
  ALTER TABLE "works" DROP COLUMN "hero_show_content";
  ALTER TABLE "works" DROP COLUMN "hero_visual_type";
  ALTER TABLE "works" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "works" DROP COLUMN "hero_shader_preset";
  ALTER TABLE "works" DROP COLUMN "hero_shader_seed";
  ALTER TABLE "works" DROP COLUMN "hero_shader_speed";
  ALTER TABLE "works" DROP COLUMN "hero_shader_intensity";
  ALTER TABLE "works" DROP COLUMN "hero_shader_bleed";
  ALTER TABLE "works" DROP COLUMN "hero_shader_origin";
  ALTER TABLE "works" DROP COLUMN "hero_shader_show_media";
  ALTER TABLE "works" DROP COLUMN "hero_shader_surface";
  ALTER TABLE "works" DROP COLUMN "hero_shader_pointer_interaction";
  ALTER TABLE "works" DROP COLUMN "hero_shader_hover_targets";
  ALTER TABLE "works" DROP COLUMN "hero_shader_section_hover";
  ALTER TABLE "works" DROP COLUMN "hero_shader_poster_media_id";
  ALTER TABLE "works" DROP COLUMN "deliverables";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_show_content";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_visual_type";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_preset";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_seed";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_speed";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_intensity";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_bleed";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_origin";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_show_media";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_surface";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_pointer_interaction";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_hover_targets";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_section_hover";
  ALTER TABLE "_works_v" DROP COLUMN "version_hero_shader_poster_media_id";
  ALTER TABLE "_works_v" DROP COLUMN "version_deliverables";
  DROP TYPE "public"."enum_works_hero_links_link_type";
  DROP TYPE "public"."enum_works_hero_links_link_appearance";
  DROP TYPE "public"."enum_works_hero_type";
  DROP TYPE "public"."enum_works_hero_visual_type";
  DROP TYPE "public"."enum_works_hero_shader_origin";
  DROP TYPE "public"."enum__works_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__works_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__works_v_version_hero_type";
  DROP TYPE "public"."enum__works_v_version_hero_visual_type";
  DROP TYPE "public"."enum__works_v_version_hero_shader_origin";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The texts tables go before `deliverables` comes back, so the joined lists
  // wait in a scratch table between the two.
  await db.execute(sql`
  CREATE TABLE "_work_hero_down_deliverables" AS
    SELECT 'works' AS "source", "parent_id", string_agg("text", ', ' ORDER BY "order") AS "deliverables"
    FROM "works_texts" WHERE "path" = 'capabilities' GROUP BY "parent_id"
    UNION ALL
    SELECT '_works_v', "parent_id", string_agg("text", ', ' ORDER BY "order")
    FROM "_works_v_texts" WHERE "path" = 'version.capabilities' GROUP BY "parent_id";`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_works_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_works_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_works_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_works_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_works_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__works_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__works_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__works_v_version_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__works_v_version_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__works_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TABLE "works_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_works_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_works_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "_works_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__works_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__works_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  ALTER TABLE "works_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "works_texts" CASCADE;
  DROP TABLE "_works_v_texts" CASCADE;
  ALTER TABLE "works" ADD COLUMN "hero_type" "enum_works_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "works" ADD COLUMN "hero_show_content" boolean DEFAULT true;
  ALTER TABLE "works" ADD COLUMN "hero_visual_type" "enum_works_hero_visual_type";
  ALTER TABLE "works" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "works" ADD COLUMN "hero_shader_preset" varchar;
  ALTER TABLE "works" ADD COLUMN "hero_shader_seed" numeric;
  ALTER TABLE "works" ADD COLUMN "hero_shader_speed" numeric;
  ALTER TABLE "works" ADD COLUMN "hero_shader_intensity" numeric;
  ALTER TABLE "works" ADD COLUMN "hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "hero_shader_origin" "enum_works_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "works" ADD COLUMN "hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "hero_shader_surface" "enum_visual_surface" DEFAULT 'auto';
  ALTER TABLE "works" ADD COLUMN "hero_shader_pointer_interaction" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "works" ADD COLUMN "hero_shader_section_hover" numeric;
  ALTER TABLE "works" ADD COLUMN "hero_shader_poster_media_id" integer;
  ALTER TABLE "works" ADD COLUMN "deliverables" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_type" "enum__works_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_show_content" boolean DEFAULT true;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_visual_type" "enum__works_v_version_hero_visual_type";
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_preset" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_seed" numeric;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_speed" numeric;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_intensity" numeric;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_origin" "enum__works_v_version_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_surface" "enum_visual_surface" DEFAULT 'auto';
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_pointer_interaction" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_section_hover" numeric;
  ALTER TABLE "_works_v" ADD COLUMN "version_hero_shader_poster_media_id" integer;
  ALTER TABLE "_works_v" ADD COLUMN "version_deliverables" varchar;
  ALTER TABLE "works_hero_links" ADD CONSTRAINT "works_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_version_hero_links" ADD CONSTRAINT "_works_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "works_hero_links_order_idx" ON "works_hero_links" USING btree ("_order");
  CREATE INDEX "works_hero_links_parent_id_idx" ON "works_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_works_v_version_hero_links_order_idx" ON "_works_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_works_v_version_hero_links_parent_id_idx" ON "_works_v_version_hero_links" USING btree ("_parent_id");
  ALTER TABLE "works" ADD CONSTRAINT "works_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works" ADD CONSTRAINT "works_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "works_hero_shader_hero_shader_studio_idx" ON "works" USING btree ("hero_shader_studio_id");
  CREATE INDEX "works_hero_shader_hero_shader_poster_media_idx" ON "works" USING btree ("hero_shader_poster_media_id");
  CREATE INDEX "_works_v_version_hero_shader_version_hero_shader_studio_idx" ON "_works_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_works_v_version_hero_shader_version_hero_shader_poster__idx" ON "_works_v" USING btree ("version_hero_shader_poster_media_id");
  ALTER TABLE "works" DROP COLUMN "client";
  ALTER TABLE "_works_v" DROP COLUMN "version_client";`)
  await db.execute(sql`
  UPDATE "works" w SET "deliverables" = d."deliverables"
    FROM "_work_hero_down_deliverables" d WHERE d."source" = 'works' AND d."parent_id" = w."id";
  UPDATE "_works_v" v SET "version_deliverables" = d."deliverables"
    FROM "_work_hero_down_deliverables" d WHERE d."source" = '_works_v' AND d."parent_id" = v."id";
  DROP TABLE "_work_hero_down_deliverables";
  UPDATE "works" SET "hero_type" = 'highImpact' WHERE "hero_media_id" IS NOT NULL;
  UPDATE "_works_v" SET "version_hero_type" = 'highImpact' WHERE "version_hero_media_id" IS NOT NULL;`)
}

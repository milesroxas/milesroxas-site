import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_archive_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_works_blocks_archive_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum__works_v_blocks_archive_theme" AS ENUM('system', 'light', 'dark');
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "theme" "enum_pages_blocks_archive_theme" DEFAULT 'system';
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "theme" "enum__pages_v_blocks_archive_theme" DEFAULT 'system';
  ALTER TABLE "works_blocks_archive" ADD COLUMN "theme" "enum_works_blocks_archive_theme" DEFAULT 'system';
  ALTER TABLE "_works_v_blocks_archive" ADD COLUMN "theme" "enum__works_v_blocks_archive_theme" DEFAULT 'system';
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "theme";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "theme";
  ALTER TABLE "works_blocks_archive" DROP COLUMN "theme";
  ALTER TABLE "_works_v_blocks_archive" DROP COLUMN "theme";
  DROP TYPE "public"."enum_pages_blocks_archive_theme";
  DROP TYPE "public"."enum__pages_v_blocks_archive_theme";
  DROP TYPE "public"."enum_works_blocks_archive_theme";
  DROP TYPE "public"."enum__works_v_blocks_archive_theme";`)
}

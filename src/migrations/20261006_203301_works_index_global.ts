import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_works_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__works_index_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "works_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Work',
  	"lead" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"_status" "enum_works_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_works_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Work',
  	"version_lead" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version__status" "enum__works_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "works_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "works_index_update" boolean DEFAULT false;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "works_index_meta_meta_image_idx" ON "works_index" USING btree ("meta_image_id");
  CREATE INDEX "works_index__status_idx" ON "works_index" USING btree ("_status");
  CREATE INDEX "_works_index_v_version_meta_version_meta_image_idx" ON "_works_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_works_index_v_version_version__status_idx" ON "_works_index_v" USING btree ("version__status");
  CREATE INDEX "_works_index_v_created_at_idx" ON "_works_index_v" USING btree ("created_at");
  CREATE INDEX "_works_index_v_updated_at_idx" ON "_works_index_v" USING btree ("updated_at");
  CREATE INDEX "_works_index_v_latest_idx" ON "_works_index_v" USING btree ("latest");
  CREATE INDEX "_works_index_v_autosave_idx" ON "_works_index_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "works_index" CASCADE;
  DROP TABLE "_works_index_v" CASCADE;
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "works_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "works_index_update";
  DROP TYPE "public"."enum_works_index_status";
  DROP TYPE "public"."enum__works_index_v_version_status";`)
}

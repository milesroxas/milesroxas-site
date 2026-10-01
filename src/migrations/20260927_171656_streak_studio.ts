import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_streak_looks_effect" AS ENUM('streakField', 'lightLeak');
  CREATE TYPE "public"."enum_streak_looks_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__streak_looks_v_version_effect" AS ENUM('streakField', 'lightLeak');
  CREATE TYPE "public"."enum__streak_looks_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE 'streak-looks';
  CREATE TABLE "streak_looks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"effect" "enum_streak_looks_effect" DEFAULT 'streakField',
  	"description" varchar,
  	"thumbnail_id" integer,
  	"light_poster_id" integer,
  	"archived" boolean DEFAULT false,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"recipe" jsonb DEFAULT '{"version":1,"seed":694,"deltas":{},"frame":150}'::jsonb,
  	"snapshot" jsonb,
  	"posters" jsonb,
  	"source_hash" varchar,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_streak_looks_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "streak_looks_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_streak_looks_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_effect" "enum__streak_looks_v_version_effect" DEFAULT 'streakField',
  	"version_description" varchar,
  	"version_thumbnail_id" integer,
  	"version_light_poster_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_recipe" jsonb DEFAULT '{"version":1,"seed":694,"deltas":{},"frame":150}'::jsonb,
  	"version_snapshot" jsonb,
  	"version_posters" jsonb,
  	"version_source_hash" varchar,
  	"version_folder_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__streak_looks_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_streak_looks_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "streak_looks_id" integer;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_light_poster_id_media_id_fk" FOREIGN KEY ("light_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks_texts" ADD CONSTRAINT "streak_looks_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."streak_looks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_parent_id_streak_looks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_light_poster_id_media_id_fk" FOREIGN KEY ("version_light_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_folder_id_payload_folders_id_fk" FOREIGN KEY ("version_folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v_texts" ADD CONSTRAINT "_streak_looks_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_streak_looks_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "streak_looks_title_idx" ON "streak_looks" USING btree ("title");
  CREATE INDEX "streak_looks_effect_idx" ON "streak_looks" USING btree ("effect");
  CREATE INDEX "streak_looks_thumbnail_idx" ON "streak_looks" USING btree ("thumbnail_id");
  CREATE INDEX "streak_looks_light_poster_idx" ON "streak_looks" USING btree ("light_poster_id");
  CREATE INDEX "streak_looks_archived_idx" ON "streak_looks" USING btree ("archived");
  CREATE INDEX "streak_looks_created_by_idx" ON "streak_looks" USING btree ("created_by_id");
  CREATE INDEX "streak_looks_updated_by_idx" ON "streak_looks" USING btree ("updated_by_id");
  CREATE INDEX "streak_looks_folder_idx" ON "streak_looks" USING btree ("folder_id");
  CREATE INDEX "streak_looks_updated_at_idx" ON "streak_looks" USING btree ("updated_at");
  CREATE INDEX "streak_looks_created_at_idx" ON "streak_looks" USING btree ("created_at");
  CREATE INDEX "streak_looks__status_idx" ON "streak_looks" USING btree ("_status");
  CREATE INDEX "streak_looks_texts_order_parent" ON "streak_looks_texts" USING btree ("order","parent_id");
  CREATE INDEX "streak_looks_texts_text_idx" ON "streak_looks_texts" USING btree ("text");
  CREATE INDEX "_streak_looks_v_parent_idx" ON "_streak_looks_v" USING btree ("parent_id");
  CREATE INDEX "_streak_looks_v_version_version_title_idx" ON "_streak_looks_v" USING btree ("version_title");
  CREATE INDEX "_streak_looks_v_version_version_effect_idx" ON "_streak_looks_v" USING btree ("version_effect");
  CREATE INDEX "_streak_looks_v_version_version_thumbnail_idx" ON "_streak_looks_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_streak_looks_v_version_version_light_poster_idx" ON "_streak_looks_v" USING btree ("version_light_poster_id");
  CREATE INDEX "_streak_looks_v_version_version_archived_idx" ON "_streak_looks_v" USING btree ("version_archived");
  CREATE INDEX "_streak_looks_v_version_version_created_by_idx" ON "_streak_looks_v" USING btree ("version_created_by_id");
  CREATE INDEX "_streak_looks_v_version_version_updated_by_idx" ON "_streak_looks_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_streak_looks_v_version_version_folder_idx" ON "_streak_looks_v" USING btree ("version_folder_id");
  CREATE INDEX "_streak_looks_v_version_version_updated_at_idx" ON "_streak_looks_v" USING btree ("version_updated_at");
  CREATE INDEX "_streak_looks_v_version_version_created_at_idx" ON "_streak_looks_v" USING btree ("version_created_at");
  CREATE INDEX "_streak_looks_v_version_version__status_idx" ON "_streak_looks_v" USING btree ("version__status");
  CREATE INDEX "_streak_looks_v_created_at_idx" ON "_streak_looks_v" USING btree ("created_at");
  CREATE INDEX "_streak_looks_v_updated_at_idx" ON "_streak_looks_v" USING btree ("updated_at");
  CREATE INDEX "_streak_looks_v_latest_idx" ON "_streak_looks_v" USING btree ("latest");
  CREATE INDEX "_streak_looks_v_autosave_idx" ON "_streak_looks_v" USING btree ("autosave");
  CREATE INDEX "_streak_looks_v_texts_order_parent" ON "_streak_looks_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_streak_looks_fk" FOREIGN KEY ("streak_looks_id") REFERENCES "public"."streak_looks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_streak_looks_id_idx" ON "payload_locked_documents_rels" USING btree ("streak_looks_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "streak_looks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "streak_looks_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_streak_looks_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_streak_looks_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "streak_looks" CASCADE;
  DROP TABLE "streak_looks_texts" CASCADE;
  DROP TABLE "_streak_looks_v" CASCADE;
  DROP TABLE "_streak_looks_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_streak_looks_fk";
  
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_folders_folder_type";
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_payload_folders_folder_type" USING "value"::"public"."enum_payload_folders_folder_type";
  DROP INDEX "payload_locked_documents_rels_streak_looks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "streak_looks_id";
  DROP TYPE "public"."enum_streak_looks_effect";
  DROP TYPE "public"."enum_streak_looks_status";
  DROP TYPE "public"."enum__streak_looks_v_version_effect";
  DROP TYPE "public"."enum__streak_looks_v_version_status";`)
}

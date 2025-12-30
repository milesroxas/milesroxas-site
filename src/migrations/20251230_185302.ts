import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create folders enum type
    DO $$ BEGIN
      CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    -- Create folders-related tables
    CREATE TABLE IF NOT EXISTS "payload_folders_folder_type" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_payload_folders_folder_type",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_folders" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "folder_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Add folder_id column to media table
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folder_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payload_folders_id" integer;

    -- Add foreign key constraints
    DO $$ BEGIN
      ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk"
        FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk"
        FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk"
        FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    -- Create indexes
    CREATE INDEX IF NOT EXISTS "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
    CREATE INDEX IF NOT EXISTS "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
    CREATE INDEX IF NOT EXISTS "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media" USING btree ("folder_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_folders_folder_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_folders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_folder_id_payload_folders_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_folders_fk";
  
  DROP INDEX "pages_blocks_content_columns_slider_slides_slide_slide_i_idx";
  DROP INDEX "_pages_v_blocks_content_columns_slider_slides_slide_slid_idx";
  DROP INDEX "works_blocks_content_columns_slider_slides_slide_slide_i_idx";
  DROP INDEX "_works_v_blocks_content_columns_slider_slides_slide_slid_idx";
  DROP INDEX "_works_v_blocks_tabs_tabs_slider_slides_slide_slide_imag_idx";
  DROP INDEX "media_folder_idx";
  DROP INDEX "payload_locked_documents_rels_payload_folders_id_idx";
  DROP INDEX "redirects_from_idx";
  CREATE INDEX "pages_blocks_content_columns_slider_slides_slide_slide_image_idx" ON "pages_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_pages_v_blocks_content_columns_slider_slides_slide_slide_image_idx" ON "_pages_v_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "works_blocks_content_columns_slider_slides_slide_slide_image_idx" ON "works_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_works_v_blocks_content_columns_slider_slides_slide_slide_image_idx" ON "_works_v_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_works_v_blocks_tabs_tabs_slider_slides_slide_slide_image_idx" ON "_works_v_blocks_tabs_tabs_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  ALTER TABLE "works" DROP COLUMN "is_password_protected";
  ALTER TABLE "works" DROP COLUMN "password";
  ALTER TABLE "_works_v" DROP COLUMN "version_is_password_protected";
  ALTER TABLE "_works_v" DROP COLUMN "version_password";
  ALTER TABLE "media" DROP COLUMN "folder_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_folders_id";
  DROP TYPE "public"."enum_payload_folders_folder_type";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * A work's client becomes a relationship to the new Clients collection.
 *
 * Up: each distinct client name typed on a work or a saved version becomes a
 * client (slug as `formatSlug` makes it), and the work or version is linked to
 * it, before the text columns are dropped.
 *
 * Down: each work and version gets its client's name back as text before the
 * links and the Clients table are dropped. The generated down dropped the
 * table first, whose CASCADE removes the foreign keys the later statements
 * drop by name, so it is reordered.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "works" ADD COLUMN "client_id" integer;
  ALTER TABLE "_works_v" ADD COLUMN "version_client_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "clients_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "clients_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "clients_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "clients_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  CREATE UNIQUE INDEX "clients_title_idx" ON "clients" USING btree ("title");
  CREATE INDEX "clients_slug_idx" ON "clients" USING btree ("slug");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  ALTER TABLE "works" ADD CONSTRAINT "works_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_client_id_clients_id_fk" FOREIGN KEY ("version_client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "works_client_idx" ON "works" USING btree ("client_id");
  CREATE INDEX "_works_v_version_version_client_idx" ON "_works_v" USING btree ("version_client_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  INSERT INTO "clients" ("title", "slug")
  SELECT name, lower(regexp_replace(replace(name, ' ', '-'), '[^A-Za-z0-9_-]+', '', 'g'))
  FROM (
    SELECT btrim("client") AS name FROM "works"
    UNION
    SELECT btrim("version_client") FROM "_works_v"
  ) names
  WHERE name <> ''
  ON CONFLICT ("title") DO NOTHING;
  UPDATE "works" w SET "client_id" = c."id" FROM "clients" c WHERE c."title" = btrim(w."client");
  UPDATE "_works_v" v SET "version_client_id" = c."id"
  FROM "clients" c WHERE c."title" = btrim(v."version_client");
  ALTER TABLE "works" DROP COLUMN "client";
  ALTER TABLE "_works_v" DROP COLUMN "version_client";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "works" ADD COLUMN "client" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_client" varchar;
  UPDATE "works" w SET "client" = c."title" FROM "clients" c WHERE c."id" = w."client_id";
  UPDATE "_works_v" v SET "version_client" = c."title"
  FROM "clients" c WHERE c."id" = v."version_client_id";
  ALTER TABLE "works" DROP CONSTRAINT "works_client_id_clients_id_fk";
  ALTER TABLE "_works_v" DROP CONSTRAINT "_works_v_version_client_id_clients_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clients_fk";
  DROP INDEX "works_client_idx";
  DROP INDEX "_works_v_version_version_client_idx";
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  ALTER TABLE "works" DROP COLUMN "client_id";
  ALTER TABLE "_works_v" DROP COLUMN "version_client_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "clients_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "clients_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "clients_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "clients_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clients" CASCADE;`)
}

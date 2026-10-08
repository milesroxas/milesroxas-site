import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "capabilities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "works_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_works_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "capabilities_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "capabilities_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "capabilities_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "capabilities_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "capabilities_id" integer;
  CREATE INDEX "capabilities__order_idx" ON "capabilities" USING btree ("_order");
  CREATE UNIQUE INDEX "capabilities_title_idx" ON "capabilities" USING btree ("title");
  CREATE INDEX "capabilities_slug_idx" ON "capabilities" USING btree ("slug");
  CREATE INDEX "capabilities_updated_at_idx" ON "capabilities" USING btree ("updated_at");
  CREATE INDEX "capabilities_created_at_idx" ON "capabilities" USING btree ("created_at");
  ALTER TABLE "works_rels" ADD CONSTRAINT "works_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_rels" ADD CONSTRAINT "_works_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "works_rels_capabilities_id_idx" ON "works_rels" USING btree ("capabilities_id");
  CREATE INDEX "_works_v_rels_capabilities_id_idx" ON "_works_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "payload_locked_documents_rels_capabilities_id_idx" ON "payload_locked_documents_rels" USING btree ("capabilities_id");
  `)

  // Before the text tables go, each free-text capability becomes a term, in
  // the order the works first use them (fractional _order keys a0..az, b00..),
  // and every work and version relates to its terms in the order it listed
  // them. Old versions keep only names a work or its latest version still uses.
  await db.execute(sql`
  WITH "used" AS (
    SELECT btrim(t."text") AS "title",
      coalesce(w."_order", '') || '.' || lpad(t."order"::text, 6, '0') AS "at"
    FROM "works_texts" t JOIN "works" w ON w."id" = t."parent_id"
    WHERE t."path" = 'capabilities'
    UNION ALL
    SELECT btrim(t."text"),
      coalesce(v."version__order", '') || '.' || lpad(t."order"::text, 6, '0')
    FROM "_works_v_texts" t JOIN "_works_v" v ON v."id" = t."parent_id"
    WHERE t."path" = 'version.capabilities' AND v."latest"
  ), "terms" AS (
    SELECT "title", row_number() OVER (ORDER BY min("at") COLLATE "C", "title")::int AS "n"
    FROM "used" WHERE "title" <> '' GROUP BY "title"
  ), "digits" AS (
    SELECT '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'::text AS "d"
  )
  INSERT INTO "capabilities" ("title", "slug", "_order")
  SELECT "title",
    lower(regexp_replace(replace("title", ' ', '-'), '[^[:alnum:]_-]+', '', 'g')),
    CASE WHEN "n" <= 62 THEN 'a' || substr("d", "n", 1)
      ELSE 'b' || substr("d", ("n" - 63) / 62 + 1, 1) || substr("d", ("n" - 63) % 62 + 1, 1) END
  FROM "terms", "digits";

  INSERT INTO "works_rels" ("order", "parent_id", "path", "capabilities_id")
  SELECT t."order", t."parent_id", 'capabilities', c."id"
  FROM "works_texts" t JOIN "capabilities" c ON c."title" = btrim(t."text")
  WHERE t."path" = 'capabilities';

  INSERT INTO "_works_v_rels" ("order", "parent_id", "path", "capabilities_id")
  SELECT t."order", t."parent_id", 'version.capabilities', c."id"
  FROM "_works_v_texts" t JOIN "capabilities" c ON c."title" = btrim(t."text")
  WHERE t."path" = 'version.capabilities';
  `)

  await db.execute(sql`
  ALTER TABLE "works_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "works_texts" CASCADE;
  DROP TABLE "_works_v_texts" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  INSERT INTO "works_texts" ("order", "parent_id", "path", "text")
  SELECT r."order", r."parent_id", 'capabilities', c."title"
  FROM "works_rels" r JOIN "capabilities" c ON c."id" = r."capabilities_id";

  INSERT INTO "_works_v_texts" ("order", "parent_id", "path", "text")
  SELECT r."order", r."parent_id", 'version.capabilities', c."title"
  FROM "_works_v_rels" r JOIN "capabilities" c ON c."id" = r."capabilities_id";

  DELETE FROM "works_rels" WHERE "capabilities_id" IS NOT NULL;
  DELETE FROM "_works_v_rels" WHERE "capabilities_id" IS NOT NULL;
  DELETE FROM "payload_locked_documents_rels" WHERE "capabilities_id" IS NOT NULL;

  ALTER TABLE "works_rels" DROP CONSTRAINT "works_rels_capabilities_fk";
  
  ALTER TABLE "_works_v_rels" DROP CONSTRAINT "_works_v_rels_capabilities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_capabilities_fk";
  
  DROP INDEX "works_rels_capabilities_id_idx";
  DROP INDEX "_works_v_rels_capabilities_id_idx";
  DROP INDEX "payload_locked_documents_rels_capabilities_id_idx";
  ALTER TABLE "works_texts" ADD CONSTRAINT "works_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_texts" ADD CONSTRAINT "_works_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "works_texts_order_parent" ON "works_texts" USING btree ("order","parent_id");
  CREATE INDEX "_works_v_texts_order_parent" ON "_works_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "works_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_works_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "capabilities_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "capabilities_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "capabilities_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "capabilities_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "capabilities" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "capabilities" CASCADE;
  `)
}

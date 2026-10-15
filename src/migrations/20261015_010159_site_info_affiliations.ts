import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_info_affiliations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"role" varchar
  );
  
  ALTER TABLE "site_info_affiliations" ADD CONSTRAINT "site_info_affiliations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_info_affiliations_order_idx" ON "site_info_affiliations" USING btree ("_order");
  CREATE INDEX "site_info_affiliations_parent_id_idx" ON "site_info_affiliations" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_info_affiliations" CASCADE;`)
}

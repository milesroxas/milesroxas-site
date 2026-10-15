import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"works_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "contact_page" ADD COLUMN "recommended_heading" varchar DEFAULT 'While you wait';
  ALTER TABLE "contact_page_rels" ADD CONSTRAINT "contact_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_rels" ADD CONSTRAINT "contact_page_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_rels" ADD CONSTRAINT "contact_page_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_page_rels_order_idx" ON "contact_page_rels" USING btree ("order");
  CREATE INDEX "contact_page_rels_parent_idx" ON "contact_page_rels" USING btree ("parent_id");
  CREATE INDEX "contact_page_rels_path_idx" ON "contact_page_rels" USING btree ("path");
  CREATE INDEX "contact_page_rels_works_id_idx" ON "contact_page_rels" USING btree ("works_id");
  CREATE INDEX "contact_page_rels_posts_id_idx" ON "contact_page_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_page_rels" CASCADE;
  ALTER TABLE "contact_page" DROP COLUMN "recommended_heading";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" ADD COLUMN "cv_id" integer;
  ALTER TABLE "contact_page" ADD COLUMN "cv_heading" varchar DEFAULT 'Miles’s CV';
  ALTER TABLE "contact_page" ADD COLUMN "cv_note" varchar DEFAULT 'Roles, clients and tools, in one file.';
  ALTER TABLE "contact_page" ADD CONSTRAINT "contact_page_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contact_page_cv_idx" ON "contact_page" USING btree ("cv_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" DROP CONSTRAINT "contact_page_cv_id_media_id_fk";
  
  DROP INDEX "contact_page_cv_idx";
  ALTER TABLE "contact_page" DROP COLUMN "cv_id";
  ALTER TABLE "contact_page" DROP COLUMN "cv_heading";
  ALTER TABLE "contact_page" DROP COLUMN "cv_note";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_info" ADD COLUMN "job_title" varchar;
  ALTER TABLE "site_info" ADD COLUMN "headshot_id" integer;
  ALTER TABLE "site_info" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "site_info" ADD CONSTRAINT "site_info_headshot_id_media_id_fk" FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_info" ADD CONSTRAINT "site_info_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_info_headshot_idx" ON "site_info" USING btree ("headshot_id");
  CREATE INDEX "site_info_og_image_idx" ON "site_info" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_info" DROP CONSTRAINT "site_info_headshot_id_media_id_fk";
  
  ALTER TABLE "site_info" DROP CONSTRAINT "site_info_og_image_id_media_id_fk";
  
  DROP INDEX "site_info_headshot_idx";
  DROP INDEX "site_info_og_image_idx";
  ALTER TABLE "site_info" DROP COLUMN "job_title";
  ALTER TABLE "site_info" DROP COLUMN "headshot_id";
  ALTER TABLE "site_info" DROP COLUMN "og_image_id";`)
}

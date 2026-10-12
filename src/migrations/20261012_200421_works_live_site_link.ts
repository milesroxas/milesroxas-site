import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "works" ADD COLUMN "link_url" varchar;
  ALTER TABLE "works" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_link_url" varchar;
  ALTER TABLE "_works_v" ADD COLUMN "version_link_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "works" DROP COLUMN "link_url";
  ALTER TABLE "works" DROP COLUMN "link_label";
  ALTER TABLE "_works_v" DROP COLUMN "version_link_url";
  ALTER TABLE "_works_v" DROP COLUMN "version_link_label";`)
}

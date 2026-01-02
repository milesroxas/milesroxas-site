import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;
  ALTER TABLE "works" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_works_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "meta_no_index";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_no_index";
  ALTER TABLE "posts" DROP COLUMN "meta_no_index";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_no_index";
  ALTER TABLE "works" DROP COLUMN "meta_no_index";
  ALTER TABLE "_works_v" DROP COLUMN "version_meta_no_index";`)
}

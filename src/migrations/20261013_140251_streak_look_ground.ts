import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "streak_looks" ADD COLUMN "ground_dark" varchar;
  ALTER TABLE "streak_looks" ADD COLUMN "ground_light" varchar;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_ground_dark" varchar;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_ground_light" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "streak_looks" DROP COLUMN "ground_dark";
  ALTER TABLE "streak_looks" DROP COLUMN "ground_light";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_ground_dark";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_ground_light";`)
}

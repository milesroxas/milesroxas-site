import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_source" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__posts_v_version_source" AS ENUM('internal', 'external');
  ALTER TABLE "posts" ADD COLUMN "external_url" varchar;
  ALTER TABLE "posts" ADD COLUMN "external_publisher" varchar DEFAULT 'Suits & Sandals';
  ALTER TABLE "posts" ADD COLUMN "source" "enum_posts_source" DEFAULT 'internal';
  ALTER TABLE "_posts_v" ADD COLUMN "version_external_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_external_publisher" varchar DEFAULT 'Suits & Sandals';
  ALTER TABLE "_posts_v" ADD COLUMN "version_source" "enum__posts_v_version_source" DEFAULT 'internal';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "external_url";
  ALTER TABLE "posts" DROP COLUMN "external_publisher";
  ALTER TABLE "posts" DROP COLUMN "source";
  ALTER TABLE "_posts_v" DROP COLUMN "version_external_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_external_publisher";
  ALTER TABLE "_posts_v" DROP COLUMN "version_source";
  DROP TYPE "public"."enum_posts_source";
  DROP TYPE "public"."enum__posts_v_version_source";`)
}

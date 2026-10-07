import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_hero_type" ADD VALUE 'editorial' BEFORE 'home';
  ALTER TYPE "public"."enum__posts_v_version_hero_type" ADD VALUE 'editorial' BEFORE 'home';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_posts_hero_type";
  CREATE TYPE "public"."enum_posts_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_posts_hero_type";
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_posts_hero_type" USING "hero_type"::"public"."enum_posts_hero_type";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__posts_v_version_hero_type";
  CREATE TYPE "public"."enum__posts_v_version_hero_type" AS ENUM('none', 'home', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__posts_v_version_hero_type";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__posts_v_version_hero_type" USING "version_hero_type"::"public"."enum__posts_v_version_hero_type";`)
}

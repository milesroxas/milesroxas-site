import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_section_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum___pages_v_section_v_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum_posts_section_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum___posts_v_section_v_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum_works_section_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum___works_v_section_v_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum_home_section_background" AS ENUM('none', 'field');
  CREATE TYPE "public"."enum___home_v_section_v_background" AS ENUM('none', 'field');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'field';
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'instrument';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'field';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'instrument';
  ALTER TABLE "pages_section" ADD COLUMN "background" "enum_pages_section_background" DEFAULT 'none';
  ALTER TABLE "__pages_v_section_v" ADD COLUMN "background" "enum___pages_v_section_v_background" DEFAULT 'none';
  ALTER TABLE "posts_section" ADD COLUMN "background" "enum_posts_section_background" DEFAULT 'none';
  ALTER TABLE "__posts_v_section_v" ADD COLUMN "background" "enum___posts_v_section_v_background" DEFAULT 'none';
  ALTER TABLE "works_section" ADD COLUMN "background" "enum_works_section_background" DEFAULT 'none';
  ALTER TABLE "__works_v_section_v" ADD COLUMN "background" "enum___works_v_section_v_background" DEFAULT 'none';
  ALTER TABLE "home_section" ADD COLUMN "background" "enum_home_section_background" DEFAULT 'none';
  ALTER TABLE "__home_v_section_v" ADD COLUMN "background" "enum___home_v_section_v_background" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "pages_section" DROP COLUMN "background";
  ALTER TABLE "__pages_v_section_v" DROP COLUMN "background";
  ALTER TABLE "posts_section" DROP COLUMN "background";
  ALTER TABLE "__posts_v_section_v" DROP COLUMN "background";
  ALTER TABLE "works_section" DROP COLUMN "background";
  ALTER TABLE "__works_v_section_v" DROP COLUMN "background";
  ALTER TABLE "home_section" DROP COLUMN "background";
  ALTER TABLE "__home_v_section_v" DROP COLUMN "background";
  DROP TYPE "public"."enum_pages_section_background";
  DROP TYPE "public"."enum___pages_v_section_v_background";
  DROP TYPE "public"."enum_posts_section_background";
  DROP TYPE "public"."enum___posts_v_section_v_background";
  DROP TYPE "public"."enum_works_section_background";
  DROP TYPE "public"."enum___works_v_section_v_background";
  DROP TYPE "public"."enum_home_section_background";
  DROP TYPE "public"."enum___home_v_section_v_background";`)
}

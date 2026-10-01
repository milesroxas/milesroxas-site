import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_carousel_tabs" ADD COLUMN "body" jsonb;
  ALTER TABLE "_pages_v_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_carousel_tabs" ADD COLUMN "body" jsonb;
  ALTER TABLE "posts_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "posts_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_carousel_tabs" ADD COLUMN "body" jsonb;
  ALTER TABLE "_posts_v_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_posts_v_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_carousel_tabs" ADD COLUMN "body" jsonb;
  ALTER TABLE "works_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "works_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "works_blocks_carousel_tabs" ADD COLUMN "body" jsonb;
  ALTER TABLE "_works_v_blocks_carousel_tabs" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_works_v_blocks_carousel_tabs" ADD COLUMN "heading" varchar;
  ALTER TABLE "_works_v_blocks_carousel_tabs" ADD COLUMN "body" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_carousel_tabs" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_carousel_tabs" DROP COLUMN "body";
  ALTER TABLE "posts_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "posts_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_carousel_tabs" DROP COLUMN "body";
  ALTER TABLE "_posts_v_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "_posts_v_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_carousel_tabs" DROP COLUMN "body";
  ALTER TABLE "works_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "works_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "works_blocks_carousel_tabs" DROP COLUMN "body";
  ALTER TABLE "_works_v_blocks_carousel_tabs" DROP COLUMN "eyebrow";
  ALTER TABLE "_works_v_blocks_carousel_tabs" DROP COLUMN "heading";
  ALTER TABLE "_works_v_blocks_carousel_tabs" DROP COLUMN "body";`)
}

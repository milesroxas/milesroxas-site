import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum_posts_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum_works_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  ALTER TABLE "pages_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum_pages_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';
  ALTER TABLE "_pages_v_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum__pages_v_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';
  ALTER TABLE "posts_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum_posts_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';
  ALTER TABLE "_posts_v_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum__posts_v_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';
  ALTER TABLE "works_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum_works_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';
  ALTER TABLE "_works_v_blocks_carousel_tabs" ADD COLUMN "deck_style" "enum__works_v_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_carousel_tabs" DROP COLUMN "deck_style";
  ALTER TABLE "_pages_v_blocks_carousel_tabs" DROP COLUMN "deck_style";
  ALTER TABLE "posts_blocks_carousel_tabs" DROP COLUMN "deck_style";
  ALTER TABLE "_posts_v_blocks_carousel_tabs" DROP COLUMN "deck_style";
  ALTER TABLE "works_blocks_carousel_tabs" DROP COLUMN "deck_style";
  ALTER TABLE "_works_v_blocks_carousel_tabs" DROP COLUMN "deck_style";
  DROP TYPE "public"."enum_pages_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum_posts_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum_works_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum__works_v_blocks_carousel_tabs_deck_style";`)
}

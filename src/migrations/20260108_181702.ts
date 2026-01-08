import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "rich_text" SET DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "rich_text" SET DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb;
  ALTER TABLE "works_blocks_media_block" ALTER COLUMN "rich_text" SET DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb;
  ALTER TABLE "_works_v_blocks_media_block" ALTER COLUMN "rich_text" SET DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "rich_text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "rich_text" DROP DEFAULT;
  ALTER TABLE "works_blocks_media_block" ALTER COLUMN "rich_text" DROP DEFAULT;
  ALTER TABLE "_works_v_blocks_media_block" ALTER COLUMN "rich_text" DROP DEFAULT;`)
}

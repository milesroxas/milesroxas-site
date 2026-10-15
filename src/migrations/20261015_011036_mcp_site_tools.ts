import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_update_seo" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_describe_fields" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_create_document" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_update_document" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_insert_block" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_move_block" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_remove_block" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_update_media" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_update_seo";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_describe_fields";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_create_document";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_update_document";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_insert_block";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_move_block";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_remove_block";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_update_media";`)
}

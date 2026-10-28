import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__pages_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_posts_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__posts_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_works_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__works_v_version_visibility" AS ENUM('public', 'members');
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" ADD COLUMN "visibility" "enum_pages_visibility" DEFAULT 'public';
  ALTER TABLE "_pages_v" ADD COLUMN "version_visibility" "enum__pages_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "posts" ADD COLUMN "visibility" "enum_posts_visibility" DEFAULT 'public';
  ALTER TABLE "_posts_v" ADD COLUMN "version_visibility" "enum__posts_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "works" ADD COLUMN "visibility" "enum_works_visibility" DEFAULT 'public';
  ALTER TABLE "_works_v" ADD COLUMN "version_visibility" "enum__works_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "search" ADD COLUMN "visibility" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_visibility_idx" ON "pages" USING btree ("visibility");
  CREATE INDEX "_pages_v_version_version_visibility_idx" ON "_pages_v" USING btree ("version_visibility");
  CREATE INDEX "posts_visibility_idx" ON "posts" USING btree ("visibility");
  CREATE INDEX "_posts_v_version_version_visibility_idx" ON "_posts_v" USING btree ("version_visibility");
  CREATE INDEX "works_visibility_idx" ON "works" USING btree ("visibility");
  CREATE INDEX "_works_v_version_version_visibility_idx" ON "_works_v" USING btree ("version_visibility");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "pages_visibility_idx";
  DROP INDEX "_pages_v_version_version_visibility_idx";
  DROP INDEX "posts_visibility_idx";
  DROP INDEX "_posts_v_version_version_visibility_idx";
  DROP INDEX "works_visibility_idx";
  DROP INDEX "_works_v_version_version_visibility_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "pages" DROP COLUMN "visibility";
  ALTER TABLE "_pages_v" DROP COLUMN "version_visibility";
  ALTER TABLE "posts" DROP COLUMN "visibility";
  ALTER TABLE "_posts_v" DROP COLUMN "version_visibility";
  ALTER TABLE "works" DROP COLUMN "visibility";
  ALTER TABLE "_works_v" DROP COLUMN "version_visibility";
  ALTER TABLE "search" DROP COLUMN "visibility";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";
  DROP TYPE "public"."enum_pages_visibility";
  DROP TYPE "public"."enum__pages_v_version_visibility";
  DROP TYPE "public"."enum_posts_visibility";
  DROP TYPE "public"."enum__posts_v_version_visibility";
  DROP TYPE "public"."enum_works_visibility";
  DROP TYPE "public"."enum__works_v_version_visibility";`)
}

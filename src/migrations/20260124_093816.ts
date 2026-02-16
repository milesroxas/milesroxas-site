import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Rename is_password_protected to is_protected
   ALTER TABLE "works" RENAME COLUMN "is_password_protected" TO "is_protected";
   ALTER TABLE "_works_v" RENAME COLUMN "version_is_password_protected" TO "version_is_protected";
   
   -- Drop password columns
   ALTER TABLE "works" DROP COLUMN IF EXISTS "password";
   ALTER TABLE "_works_v" DROP COLUMN IF EXISTS "version_password";
   
   -- Add fallback_work columns
   ALTER TABLE "works" ADD COLUMN "fallback_work_id" integer;
   ALTER TABLE "_works_v" ADD COLUMN "version_fallback_work_id" integer;
   
   -- Add foreign key constraints
   DO $$ BEGIN
    ALTER TABLE "works" ADD CONSTRAINT "works_fallback_work_id_works_id_fk" FOREIGN KEY ("fallback_work_id") REFERENCES "works"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;
   
   DO $$ BEGIN
    ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_fallback_work_id_works_id_fk" FOREIGN KEY ("version_fallback_work_id") REFERENCES "works"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;
   
   -- Create indexes
   CREATE INDEX IF NOT EXISTS "works_fallback_work_idx" ON "works" USING btree ("fallback_work_id");
   CREATE INDEX IF NOT EXISTS "_works_v_version_fallback_work_idx" ON "_works_v" USING btree ("version_fallback_work_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Drop indexes
   DROP INDEX IF EXISTS "works_fallback_work_idx";
   DROP INDEX IF EXISTS "_works_v_version_fallback_work_idx";
   
   -- Drop foreign key constraints
   ALTER TABLE "works" DROP CONSTRAINT IF EXISTS "works_fallback_work_id_works_id_fk";
   ALTER TABLE "_works_v" DROP CONSTRAINT IF EXISTS "_works_v_version_fallback_work_id_works_id_fk";
   
   -- Drop fallback_work columns
   ALTER TABLE "works" DROP COLUMN IF EXISTS "fallback_work_id";
   ALTER TABLE "_works_v" DROP COLUMN IF EXISTS "version_fallback_work_id";
   
   -- Add password columns back
   ALTER TABLE "works" ADD COLUMN "password" varchar;
   ALTER TABLE "_works_v" ADD COLUMN "version_password" varchar;
   
   -- Rename is_protected back to is_password_protected
   ALTER TABLE "works" RENAME COLUMN "is_protected" TO "is_password_protected";
   ALTER TABLE "_works_v" RENAME COLUMN "version_is_protected" TO "version_is_password_protected";`)
}

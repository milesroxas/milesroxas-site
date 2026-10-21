import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "streak_looks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_streak_looks_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "streak_looks" ADD COLUMN "stills" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_stills" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "streak_looks_rels" ADD CONSTRAINT "streak_looks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."streak_looks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "streak_looks_rels" ADD CONSTRAINT "streak_looks_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_streak_looks_v_rels" ADD CONSTRAINT "_streak_looks_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_streak_looks_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_streak_looks_v_rels" ADD CONSTRAINT "_streak_looks_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "streak_looks_rels_order_idx" ON "streak_looks_rels" USING btree ("order");
  CREATE INDEX "streak_looks_rels_parent_idx" ON "streak_looks_rels" USING btree ("parent_id");
  CREATE INDEX "streak_looks_rels_path_idx" ON "streak_looks_rels" USING btree ("path");
  CREATE INDEX "streak_looks_rels_media_id_idx" ON "streak_looks_rels" USING btree ("media_id");
  CREATE INDEX "_streak_looks_v_rels_order_idx" ON "_streak_looks_v_rels" USING btree ("order");
  CREATE INDEX "_streak_looks_v_rels_parent_idx" ON "_streak_looks_v_rels" USING btree ("parent_id");
  CREATE INDEX "_streak_looks_v_rels_path_idx" ON "_streak_looks_v_rels" USING btree ("path");
  CREATE INDEX "_streak_looks_v_rels_media_id_idx" ON "_streak_looks_v_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "streak_looks_rels" CASCADE;
  DROP TABLE "_streak_looks_v_rels" CASCADE;
  ALTER TABLE "streak_looks" DROP COLUMN "stills";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_stills";`)
}

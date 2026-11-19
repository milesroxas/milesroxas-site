import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_cta_link_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum___pages_v_cta_link_v_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum_posts_cta_link_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum___posts_v_cta_link_v_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum_works_cta_link_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum___works_v_cta_link_v_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum_home_cta_link_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TYPE "public"."enum___home_v_cta_link_v_target_type" ADD VALUE 'page' BEFORE 'external';
  ALTER TABLE "pages_cta_link" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "__pages_v_cta_link_v" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "posts_cta_link" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "__posts_v_cta_link_v" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "works_cta_link" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "__works_v_cta_link_v" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "home_cta_link" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "__home_v_cta_link_v" RENAME COLUMN "image_id" TO "media_id";
  ALTER TABLE "pages_cta_link" DROP CONSTRAINT "pages_cta_link_image_id_media_id_fk";
  
  ALTER TABLE "__pages_v_cta_link_v" DROP CONSTRAINT "__pages_v_cta_link_v_image_id_media_id_fk";
  
  ALTER TABLE "posts_cta_link" DROP CONSTRAINT "posts_cta_link_image_id_media_id_fk";
  
  ALTER TABLE "__posts_v_cta_link_v" DROP CONSTRAINT "__posts_v_cta_link_v_image_id_media_id_fk";
  
  ALTER TABLE "works_cta_link" DROP CONSTRAINT "works_cta_link_image_id_media_id_fk";
  
  ALTER TABLE "__works_v_cta_link_v" DROP CONSTRAINT "__works_v_cta_link_v_image_id_media_id_fk";
  
  ALTER TABLE "home_cta_link" DROP CONSTRAINT "home_cta_link_image_id_media_id_fk";
  
  ALTER TABLE "__home_v_cta_link_v" DROP CONSTRAINT "__home_v_cta_link_v_image_id_media_id_fk";
  
  DROP INDEX "pages_cta_link_image_idx";
  DROP INDEX "__pages_v_cta_link_v_image_idx";
  DROP INDEX "posts_cta_link_image_idx";
  DROP INDEX "__posts_v_cta_link_v_image_idx";
  DROP INDEX "works_cta_link_image_idx";
  DROP INDEX "__works_v_cta_link_v_image_idx";
  DROP INDEX "home_cta_link_image_idx";
  DROP INDEX "__home_v_cta_link_v_image_idx";
  ALTER TABLE "pages_cta_link" ADD COLUMN "page_id" integer;
  ALTER TABLE "pages_cta_link" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "pages_cta_link" ADD COLUMN "video_id" integer;
  ALTER TABLE "__pages_v_cta_link_v" ADD COLUMN "page_id" integer;
  ALTER TABLE "__pages_v_cta_link_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__pages_v_cta_link_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "posts_cta_link" ADD COLUMN "page_id" integer;
  ALTER TABLE "posts_cta_link" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "posts_cta_link" ADD COLUMN "video_id" integer;
  ALTER TABLE "__posts_v_cta_link_v" ADD COLUMN "page_id" integer;
  ALTER TABLE "__posts_v_cta_link_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__posts_v_cta_link_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "works_cta_link" ADD COLUMN "page_id" integer;
  ALTER TABLE "works_cta_link" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "works_cta_link" ADD COLUMN "video_id" integer;
  ALTER TABLE "__works_v_cta_link_v" ADD COLUMN "page_id" integer;
  ALTER TABLE "__works_v_cta_link_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__works_v_cta_link_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "home_cta_link" ADD COLUMN "page_id" integer;
  ALTER TABLE "home_cta_link" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "home_cta_link" ADD COLUMN "video_id" integer;
  ALTER TABLE "__home_v_cta_link_v" ADD COLUMN "page_id" integer;
  ALTER TABLE "__home_v_cta_link_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__home_v_cta_link_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_cta_link_page_idx" ON "pages_cta_link" USING btree ("page_id");
  CREATE INDEX "pages_cta_link_video_idx" ON "pages_cta_link" USING btree ("video_id");
  CREATE INDEX "pages_cta_link_media_idx" ON "pages_cta_link" USING btree ("media_id");
  CREATE INDEX "__pages_v_cta_link_v_page_idx" ON "__pages_v_cta_link_v" USING btree ("page_id");
  CREATE INDEX "__pages_v_cta_link_v_video_idx" ON "__pages_v_cta_link_v" USING btree ("video_id");
  CREATE INDEX "__pages_v_cta_link_v_media_idx" ON "__pages_v_cta_link_v" USING btree ("media_id");
  CREATE INDEX "posts_cta_link_page_idx" ON "posts_cta_link" USING btree ("page_id");
  CREATE INDEX "posts_cta_link_video_idx" ON "posts_cta_link" USING btree ("video_id");
  CREATE INDEX "posts_cta_link_media_idx" ON "posts_cta_link" USING btree ("media_id");
  CREATE INDEX "__posts_v_cta_link_v_page_idx" ON "__posts_v_cta_link_v" USING btree ("page_id");
  CREATE INDEX "__posts_v_cta_link_v_video_idx" ON "__posts_v_cta_link_v" USING btree ("video_id");
  CREATE INDEX "__posts_v_cta_link_v_media_idx" ON "__posts_v_cta_link_v" USING btree ("media_id");
  CREATE INDEX "works_cta_link_page_idx" ON "works_cta_link" USING btree ("page_id");
  CREATE INDEX "works_cta_link_video_idx" ON "works_cta_link" USING btree ("video_id");
  CREATE INDEX "works_cta_link_media_idx" ON "works_cta_link" USING btree ("media_id");
  CREATE INDEX "__works_v_cta_link_v_page_idx" ON "__works_v_cta_link_v" USING btree ("page_id");
  CREATE INDEX "__works_v_cta_link_v_video_idx" ON "__works_v_cta_link_v" USING btree ("video_id");
  CREATE INDEX "__works_v_cta_link_v_media_idx" ON "__works_v_cta_link_v" USING btree ("media_id");
  CREATE INDEX "home_cta_link_page_idx" ON "home_cta_link" USING btree ("page_id");
  CREATE INDEX "home_cta_link_video_idx" ON "home_cta_link" USING btree ("video_id");
  CREATE INDEX "home_cta_link_media_idx" ON "home_cta_link" USING btree ("media_id");
  CREATE INDEX "__home_v_cta_link_v_page_idx" ON "__home_v_cta_link_v" USING btree ("page_id");
  CREATE INDEX "__home_v_cta_link_v_video_idx" ON "__home_v_cta_link_v" USING btree ("video_id");
  CREATE INDEX "__home_v_cta_link_v_media_idx" ON "__home_v_cta_link_v" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_cta_link" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "__pages_v_cta_link_v" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "posts_cta_link" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "__posts_v_cta_link_v" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "works_cta_link" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "__works_v_cta_link_v" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "home_cta_link" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "__home_v_cta_link_v" RENAME COLUMN "media_id" TO "image_id";
  ALTER TABLE "pages_cta_link" DROP CONSTRAINT "pages_cta_link_page_id_pages_id_fk";
  
  ALTER TABLE "pages_cta_link" DROP CONSTRAINT "pages_cta_link_video_id_videos_id_fk";
  
  ALTER TABLE "pages_cta_link" DROP CONSTRAINT "pages_cta_link_media_id_media_id_fk";
  
  ALTER TABLE "__pages_v_cta_link_v" DROP CONSTRAINT "__pages_v_cta_link_v_page_id_pages_id_fk";
  
  ALTER TABLE "__pages_v_cta_link_v" DROP CONSTRAINT "__pages_v_cta_link_v_video_id_videos_id_fk";
  
  ALTER TABLE "__pages_v_cta_link_v" DROP CONSTRAINT "__pages_v_cta_link_v_media_id_media_id_fk";
  
  ALTER TABLE "posts_cta_link" DROP CONSTRAINT "posts_cta_link_page_id_pages_id_fk";
  
  ALTER TABLE "posts_cta_link" DROP CONSTRAINT "posts_cta_link_video_id_videos_id_fk";
  
  ALTER TABLE "posts_cta_link" DROP CONSTRAINT "posts_cta_link_media_id_media_id_fk";
  
  ALTER TABLE "__posts_v_cta_link_v" DROP CONSTRAINT "__posts_v_cta_link_v_page_id_pages_id_fk";
  
  ALTER TABLE "__posts_v_cta_link_v" DROP CONSTRAINT "__posts_v_cta_link_v_video_id_videos_id_fk";
  
  ALTER TABLE "__posts_v_cta_link_v" DROP CONSTRAINT "__posts_v_cta_link_v_media_id_media_id_fk";
  
  ALTER TABLE "works_cta_link" DROP CONSTRAINT "works_cta_link_page_id_pages_id_fk";
  
  ALTER TABLE "works_cta_link" DROP CONSTRAINT "works_cta_link_video_id_videos_id_fk";
  
  ALTER TABLE "works_cta_link" DROP CONSTRAINT "works_cta_link_media_id_media_id_fk";
  
  ALTER TABLE "__works_v_cta_link_v" DROP CONSTRAINT "__works_v_cta_link_v_page_id_pages_id_fk";
  
  ALTER TABLE "__works_v_cta_link_v" DROP CONSTRAINT "__works_v_cta_link_v_video_id_videos_id_fk";
  
  ALTER TABLE "__works_v_cta_link_v" DROP CONSTRAINT "__works_v_cta_link_v_media_id_media_id_fk";
  
  ALTER TABLE "home_cta_link" DROP CONSTRAINT "home_cta_link_page_id_pages_id_fk";
  
  ALTER TABLE "home_cta_link" DROP CONSTRAINT "home_cta_link_video_id_videos_id_fk";
  
  ALTER TABLE "home_cta_link" DROP CONSTRAINT "home_cta_link_media_id_media_id_fk";
  
  ALTER TABLE "__home_v_cta_link_v" DROP CONSTRAINT "__home_v_cta_link_v_page_id_pages_id_fk";
  
  ALTER TABLE "__home_v_cta_link_v" DROP CONSTRAINT "__home_v_cta_link_v_video_id_videos_id_fk";
  
  ALTER TABLE "__home_v_cta_link_v" DROP CONSTRAINT "__home_v_cta_link_v_media_id_media_id_fk";
  
  ALTER TABLE "pages_cta_link" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_cta_link_target_type";
  CREATE TYPE "public"."enum_pages_cta_link_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "pages_cta_link" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_pages_cta_link_target_type" USING "target_type"::"public"."enum_pages_cta_link_target_type";
  ALTER TABLE "__pages_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum___pages_v_cta_link_v_target_type";
  CREATE TYPE "public"."enum___pages_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "__pages_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum___pages_v_cta_link_v_target_type" USING "target_type"::"public"."enum___pages_v_cta_link_v_target_type";
  ALTER TABLE "posts_cta_link" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_cta_link_target_type";
  CREATE TYPE "public"."enum_posts_cta_link_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "posts_cta_link" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_posts_cta_link_target_type" USING "target_type"::"public"."enum_posts_cta_link_target_type";
  ALTER TABLE "__posts_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum___posts_v_cta_link_v_target_type";
  CREATE TYPE "public"."enum___posts_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "__posts_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum___posts_v_cta_link_v_target_type" USING "target_type"::"public"."enum___posts_v_cta_link_v_target_type";
  ALTER TABLE "works_cta_link" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_cta_link_target_type";
  CREATE TYPE "public"."enum_works_cta_link_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "works_cta_link" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_works_cta_link_target_type" USING "target_type"::"public"."enum_works_cta_link_target_type";
  ALTER TABLE "__works_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum___works_v_cta_link_v_target_type";
  CREATE TYPE "public"."enum___works_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "__works_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum___works_v_cta_link_v_target_type" USING "target_type"::"public"."enum___works_v_cta_link_v_target_type";
  ALTER TABLE "home_cta_link" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_cta_link_target_type";
  CREATE TYPE "public"."enum_home_cta_link_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "home_cta_link" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_home_cta_link_target_type" USING "target_type"::"public"."enum_home_cta_link_target_type";
  ALTER TABLE "__home_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum___home_v_cta_link_v_target_type";
  CREATE TYPE "public"."enum___home_v_cta_link_v_target_type" AS ENUM('work', 'post', 'external');
  ALTER TABLE "__home_v_cta_link_v" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum___home_v_cta_link_v_target_type" USING "target_type"::"public"."enum___home_v_cta_link_v_target_type";
  DROP INDEX "pages_cta_link_page_idx";
  DROP INDEX "pages_cta_link_video_idx";
  DROP INDEX "pages_cta_link_media_idx";
  DROP INDEX "__pages_v_cta_link_v_page_idx";
  DROP INDEX "__pages_v_cta_link_v_video_idx";
  DROP INDEX "__pages_v_cta_link_v_media_idx";
  DROP INDEX "posts_cta_link_page_idx";
  DROP INDEX "posts_cta_link_video_idx";
  DROP INDEX "posts_cta_link_media_idx";
  DROP INDEX "__posts_v_cta_link_v_page_idx";
  DROP INDEX "__posts_v_cta_link_v_video_idx";
  DROP INDEX "__posts_v_cta_link_v_media_idx";
  DROP INDEX "works_cta_link_page_idx";
  DROP INDEX "works_cta_link_video_idx";
  DROP INDEX "works_cta_link_media_idx";
  DROP INDEX "__works_v_cta_link_v_page_idx";
  DROP INDEX "__works_v_cta_link_v_video_idx";
  DROP INDEX "__works_v_cta_link_v_media_idx";
  DROP INDEX "home_cta_link_page_idx";
  DROP INDEX "home_cta_link_video_idx";
  DROP INDEX "home_cta_link_media_idx";
  DROP INDEX "__home_v_cta_link_v_page_idx";
  DROP INDEX "__home_v_cta_link_v_video_idx";
  DROP INDEX "__home_v_cta_link_v_media_idx";
  ALTER TABLE "pages_cta_link" ADD CONSTRAINT "pages_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_link_v" ADD CONSTRAINT "__pages_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_cta_link" ADD CONSTRAINT "posts_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_link_v" ADD CONSTRAINT "__posts_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_cta_link" ADD CONSTRAINT "works_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_cta_link_v" ADD CONSTRAINT "__works_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_cta_link" ADD CONSTRAINT "home_cta_link_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_cta_link_v" ADD CONSTRAINT "__home_v_cta_link_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_cta_link_image_idx" ON "pages_cta_link" USING btree ("image_id");
  CREATE INDEX "__pages_v_cta_link_v_image_idx" ON "__pages_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "posts_cta_link_image_idx" ON "posts_cta_link" USING btree ("image_id");
  CREATE INDEX "__posts_v_cta_link_v_image_idx" ON "__posts_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "works_cta_link_image_idx" ON "works_cta_link" USING btree ("image_id");
  CREATE INDEX "__works_v_cta_link_v_image_idx" ON "__works_v_cta_link_v" USING btree ("image_id");
  CREATE INDEX "home_cta_link_image_idx" ON "home_cta_link" USING btree ("image_id");
  CREATE INDEX "__home_v_cta_link_v_image_idx" ON "__home_v_cta_link_v" USING btree ("image_id");
  ALTER TABLE "pages_cta_link" DROP COLUMN "page_id";
  ALTER TABLE "pages_cta_link" DROP COLUMN "play_video";
  ALTER TABLE "pages_cta_link" DROP COLUMN "video_id";
  ALTER TABLE "__pages_v_cta_link_v" DROP COLUMN "page_id";
  ALTER TABLE "__pages_v_cta_link_v" DROP COLUMN "play_video";
  ALTER TABLE "__pages_v_cta_link_v" DROP COLUMN "video_id";
  ALTER TABLE "posts_cta_link" DROP COLUMN "page_id";
  ALTER TABLE "posts_cta_link" DROP COLUMN "play_video";
  ALTER TABLE "posts_cta_link" DROP COLUMN "video_id";
  ALTER TABLE "__posts_v_cta_link_v" DROP COLUMN "page_id";
  ALTER TABLE "__posts_v_cta_link_v" DROP COLUMN "play_video";
  ALTER TABLE "__posts_v_cta_link_v" DROP COLUMN "video_id";
  ALTER TABLE "works_cta_link" DROP COLUMN "page_id";
  ALTER TABLE "works_cta_link" DROP COLUMN "play_video";
  ALTER TABLE "works_cta_link" DROP COLUMN "video_id";
  ALTER TABLE "__works_v_cta_link_v" DROP COLUMN "page_id";
  ALTER TABLE "__works_v_cta_link_v" DROP COLUMN "play_video";
  ALTER TABLE "__works_v_cta_link_v" DROP COLUMN "video_id";
  ALTER TABLE "home_cta_link" DROP COLUMN "page_id";
  ALTER TABLE "home_cta_link" DROP COLUMN "play_video";
  ALTER TABLE "home_cta_link" DROP COLUMN "video_id";
  ALTER TABLE "__home_v_cta_link_v" DROP COLUMN "page_id";
  ALTER TABLE "__home_v_cta_link_v" DROP COLUMN "play_video";
  ALTER TABLE "__home_v_cta_link_v" DROP COLUMN "video_id";`)
}

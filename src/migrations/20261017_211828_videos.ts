import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"loop_start" numeric,
  	"loop_length" numeric,
  	"duration" numeric,
  	"cloudflare_stream_uid" varchar,
  	"cloudflare_stream_ready" boolean DEFAULT false,
  	"loop_uid" varchar,
  	"loop_ready" boolean DEFAULT false,
  	"stream_error" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "pages_full_media" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "pages_full_media" ADD COLUMN "video_id" integer;
  ALTER TABLE "pages_media_split" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "pages_media_split" ADD COLUMN "video_id" integer;
  ALTER TABLE "pages_split_narrow" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "pages_split_narrow" ADD COLUMN "video_id" integer;
  ALTER TABLE "pages_caption" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "pages_caption" ADD COLUMN "video_id" integer;
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__pages_v_media_split_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__pages_v_media_split_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__pages_v_split_narrow_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__pages_v_split_narrow_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__pages_v_caption_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__pages_v_caption_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "posts_full_media" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "posts_full_media" ADD COLUMN "video_id" integer;
  ALTER TABLE "posts_media_split" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "posts_media_split" ADD COLUMN "video_id" integer;
  ALTER TABLE "posts_split_narrow" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "posts_split_narrow" ADD COLUMN "video_id" integer;
  ALTER TABLE "posts_caption" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "posts_caption" ADD COLUMN "video_id" integer;
  ALTER TABLE "__posts_v_full_media_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__posts_v_full_media_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__posts_v_media_split_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__posts_v_media_split_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__posts_v_split_narrow_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__posts_v_split_narrow_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__posts_v_caption_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__posts_v_caption_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "works_full_media" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "works_full_media" ADD COLUMN "video_id" integer;
  ALTER TABLE "works_media_split" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "works_media_split" ADD COLUMN "video_id" integer;
  ALTER TABLE "works_split_narrow" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "works_split_narrow" ADD COLUMN "video_id" integer;
  ALTER TABLE "works_caption" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "works_caption" ADD COLUMN "video_id" integer;
  ALTER TABLE "__works_v_full_media_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__works_v_full_media_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__works_v_media_split_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__works_v_media_split_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__works_v_split_narrow_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__works_v_split_narrow_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "__works_v_caption_v" ADD COLUMN "play_video" boolean DEFAULT false;
  ALTER TABLE "__works_v_caption_v" ADD COLUMN "video_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "videos_find" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" integer;
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_filename_idx" ON "videos" USING btree ("filename");
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_caption" ADD CONSTRAINT "pages_caption_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_caption_v" ADD CONSTRAINT "__pages_v_caption_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_caption" ADD CONSTRAINT "posts_caption_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_caption_v" ADD CONSTRAINT "__posts_v_caption_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_full_media" ADD CONSTRAINT "works_full_media_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_media_split" ADD CONSTRAINT "works_media_split_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_narrow" ADD CONSTRAINT "works_split_narrow_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_caption" ADD CONSTRAINT "works_caption_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_full_media_v" ADD CONSTRAINT "__works_v_full_media_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_media_split_v" ADD CONSTRAINT "__works_v_media_split_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v" ADD CONSTRAINT "__works_v_split_narrow_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_caption_v" ADD CONSTRAINT "__works_v_caption_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_full_media_video_idx" ON "pages_full_media" USING btree ("video_id");
  CREATE INDEX "pages_media_split_video_idx" ON "pages_media_split" USING btree ("video_id");
  CREATE INDEX "pages_split_narrow_video_idx" ON "pages_split_narrow" USING btree ("video_id");
  CREATE INDEX "pages_caption_video_idx" ON "pages_caption" USING btree ("video_id");
  CREATE INDEX "__pages_v_full_media_v_video_idx" ON "__pages_v_full_media_v" USING btree ("video_id");
  CREATE INDEX "__pages_v_media_split_v_video_idx" ON "__pages_v_media_split_v" USING btree ("video_id");
  CREATE INDEX "__pages_v_split_narrow_v_video_idx" ON "__pages_v_split_narrow_v" USING btree ("video_id");
  CREATE INDEX "__pages_v_caption_v_video_idx" ON "__pages_v_caption_v" USING btree ("video_id");
  CREATE INDEX "posts_full_media_video_idx" ON "posts_full_media" USING btree ("video_id");
  CREATE INDEX "posts_media_split_video_idx" ON "posts_media_split" USING btree ("video_id");
  CREATE INDEX "posts_split_narrow_video_idx" ON "posts_split_narrow" USING btree ("video_id");
  CREATE INDEX "posts_caption_video_idx" ON "posts_caption" USING btree ("video_id");
  CREATE INDEX "__posts_v_full_media_v_video_idx" ON "__posts_v_full_media_v" USING btree ("video_id");
  CREATE INDEX "__posts_v_media_split_v_video_idx" ON "__posts_v_media_split_v" USING btree ("video_id");
  CREATE INDEX "__posts_v_split_narrow_v_video_idx" ON "__posts_v_split_narrow_v" USING btree ("video_id");
  CREATE INDEX "__posts_v_caption_v_video_idx" ON "__posts_v_caption_v" USING btree ("video_id");
  CREATE INDEX "works_full_media_video_idx" ON "works_full_media" USING btree ("video_id");
  CREATE INDEX "works_media_split_video_idx" ON "works_media_split" USING btree ("video_id");
  CREATE INDEX "works_split_narrow_video_idx" ON "works_split_narrow" USING btree ("video_id");
  CREATE INDEX "works_caption_video_idx" ON "works_caption" USING btree ("video_id");
  CREATE INDEX "__works_v_full_media_v_video_idx" ON "__works_v_full_media_v" USING btree ("video_id");
  CREATE INDEX "__works_v_media_split_v_video_idx" ON "__works_v_media_split_v" USING btree ("video_id");
  CREATE INDEX "__works_v_split_narrow_v_video_idx" ON "__works_v_split_narrow_v" USING btree ("video_id");
  CREATE INDEX "__works_v_caption_v_video_idx" ON "__works_v_caption_v" USING btree ("video_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'askQuestionRetention', 'cloudflareMediaSweep', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'askQuestionRetention', 'cloudflareMediaSweep', 'schedulePublish');
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "videos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "videos" CASCADE;
  ALTER TABLE "pages_full_media" DROP CONSTRAINT "pages_full_media_video_id_videos_id_fk";
  
  ALTER TABLE "pages_media_split" DROP CONSTRAINT "pages_media_split_video_id_videos_id_fk";
  
  ALTER TABLE "pages_split_narrow" DROP CONSTRAINT "pages_split_narrow_video_id_videos_id_fk";
  
  ALTER TABLE "pages_caption" DROP CONSTRAINT "pages_caption_video_id_videos_id_fk";
  
  ALTER TABLE "__pages_v_full_media_v" DROP CONSTRAINT "__pages_v_full_media_v_video_id_videos_id_fk";
  
  ALTER TABLE "__pages_v_media_split_v" DROP CONSTRAINT "__pages_v_media_split_v_video_id_videos_id_fk";
  
  ALTER TABLE "__pages_v_split_narrow_v" DROP CONSTRAINT "__pages_v_split_narrow_v_video_id_videos_id_fk";
  
  ALTER TABLE "__pages_v_caption_v" DROP CONSTRAINT "__pages_v_caption_v_video_id_videos_id_fk";
  
  ALTER TABLE "posts_full_media" DROP CONSTRAINT "posts_full_media_video_id_videos_id_fk";
  
  ALTER TABLE "posts_media_split" DROP CONSTRAINT "posts_media_split_video_id_videos_id_fk";
  
  ALTER TABLE "posts_split_narrow" DROP CONSTRAINT "posts_split_narrow_video_id_videos_id_fk";
  
  ALTER TABLE "posts_caption" DROP CONSTRAINT "posts_caption_video_id_videos_id_fk";
  
  ALTER TABLE "__posts_v_full_media_v" DROP CONSTRAINT "__posts_v_full_media_v_video_id_videos_id_fk";
  
  ALTER TABLE "__posts_v_media_split_v" DROP CONSTRAINT "__posts_v_media_split_v_video_id_videos_id_fk";
  
  ALTER TABLE "__posts_v_split_narrow_v" DROP CONSTRAINT "__posts_v_split_narrow_v_video_id_videos_id_fk";
  
  ALTER TABLE "__posts_v_caption_v" DROP CONSTRAINT "__posts_v_caption_v_video_id_videos_id_fk";
  
  ALTER TABLE "works_full_media" DROP CONSTRAINT "works_full_media_video_id_videos_id_fk";
  
  ALTER TABLE "works_media_split" DROP CONSTRAINT "works_media_split_video_id_videos_id_fk";
  
  ALTER TABLE "works_split_narrow" DROP CONSTRAINT "works_split_narrow_video_id_videos_id_fk";
  
  ALTER TABLE "works_caption" DROP CONSTRAINT "works_caption_video_id_videos_id_fk";
  
  ALTER TABLE "__works_v_full_media_v" DROP CONSTRAINT "__works_v_full_media_v_video_id_videos_id_fk";
  
  ALTER TABLE "__works_v_media_split_v" DROP CONSTRAINT "__works_v_media_split_v_video_id_videos_id_fk";
  
  ALTER TABLE "__works_v_split_narrow_v" DROP CONSTRAINT "__works_v_split_narrow_v_video_id_videos_id_fk";
  
  ALTER TABLE "__works_v_caption_v" DROP CONSTRAINT "__works_v_caption_v_video_id_videos_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_videos_fk";
  
  DROP INDEX "pages_full_media_video_idx";
  DROP INDEX "pages_media_split_video_idx";
  DROP INDEX "pages_split_narrow_video_idx";
  DROP INDEX "pages_caption_video_idx";
  DROP INDEX "__pages_v_full_media_v_video_idx";
  DROP INDEX "__pages_v_media_split_v_video_idx";
  DROP INDEX "__pages_v_split_narrow_v_video_idx";
  DROP INDEX "__pages_v_caption_v_video_idx";
  DROP INDEX "posts_full_media_video_idx";
  DROP INDEX "posts_media_split_video_idx";
  DROP INDEX "posts_split_narrow_video_idx";
  DROP INDEX "posts_caption_video_idx";
  DROP INDEX "__posts_v_full_media_v_video_idx";
  DROP INDEX "__posts_v_media_split_v_video_idx";
  DROP INDEX "__posts_v_split_narrow_v_video_idx";
  DROP INDEX "__posts_v_caption_v_video_idx";
  DROP INDEX "works_full_media_video_idx";
  DROP INDEX "works_media_split_video_idx";
  DROP INDEX "works_split_narrow_video_idx";
  DROP INDEX "works_caption_video_idx";
  DROP INDEX "__works_v_full_media_v_video_idx";
  DROP INDEX "__works_v_media_split_v_video_idx";
  DROP INDEX "__works_v_split_narrow_v_video_idx";
  DROP INDEX "__works_v_caption_v_video_idx";
  DROP INDEX "payload_locked_documents_rels_videos_id_idx";
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "pages_full_media" DROP COLUMN "play_video";
  ALTER TABLE "pages_full_media" DROP COLUMN "video_id";
  ALTER TABLE "pages_media_split" DROP COLUMN "play_video";
  ALTER TABLE "pages_media_split" DROP COLUMN "video_id";
  ALTER TABLE "pages_split_narrow" DROP COLUMN "play_video";
  ALTER TABLE "pages_split_narrow" DROP COLUMN "video_id";
  ALTER TABLE "pages_caption" DROP COLUMN "play_video";
  ALTER TABLE "pages_caption" DROP COLUMN "video_id";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "play_video";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "video_id";
  ALTER TABLE "__pages_v_media_split_v" DROP COLUMN "play_video";
  ALTER TABLE "__pages_v_media_split_v" DROP COLUMN "video_id";
  ALTER TABLE "__pages_v_split_narrow_v" DROP COLUMN "play_video";
  ALTER TABLE "__pages_v_split_narrow_v" DROP COLUMN "video_id";
  ALTER TABLE "__pages_v_caption_v" DROP COLUMN "play_video";
  ALTER TABLE "__pages_v_caption_v" DROP COLUMN "video_id";
  ALTER TABLE "posts_full_media" DROP COLUMN "play_video";
  ALTER TABLE "posts_full_media" DROP COLUMN "video_id";
  ALTER TABLE "posts_media_split" DROP COLUMN "play_video";
  ALTER TABLE "posts_media_split" DROP COLUMN "video_id";
  ALTER TABLE "posts_split_narrow" DROP COLUMN "play_video";
  ALTER TABLE "posts_split_narrow" DROP COLUMN "video_id";
  ALTER TABLE "posts_caption" DROP COLUMN "play_video";
  ALTER TABLE "posts_caption" DROP COLUMN "video_id";
  ALTER TABLE "__posts_v_full_media_v" DROP COLUMN "play_video";
  ALTER TABLE "__posts_v_full_media_v" DROP COLUMN "video_id";
  ALTER TABLE "__posts_v_media_split_v" DROP COLUMN "play_video";
  ALTER TABLE "__posts_v_media_split_v" DROP COLUMN "video_id";
  ALTER TABLE "__posts_v_split_narrow_v" DROP COLUMN "play_video";
  ALTER TABLE "__posts_v_split_narrow_v" DROP COLUMN "video_id";
  ALTER TABLE "__posts_v_caption_v" DROP COLUMN "play_video";
  ALTER TABLE "__posts_v_caption_v" DROP COLUMN "video_id";
  ALTER TABLE "works_full_media" DROP COLUMN "play_video";
  ALTER TABLE "works_full_media" DROP COLUMN "video_id";
  ALTER TABLE "works_media_split" DROP COLUMN "play_video";
  ALTER TABLE "works_media_split" DROP COLUMN "video_id";
  ALTER TABLE "works_split_narrow" DROP COLUMN "play_video";
  ALTER TABLE "works_split_narrow" DROP COLUMN "video_id";
  ALTER TABLE "works_caption" DROP COLUMN "play_video";
  ALTER TABLE "works_caption" DROP COLUMN "video_id";
  ALTER TABLE "__works_v_full_media_v" DROP COLUMN "play_video";
  ALTER TABLE "__works_v_full_media_v" DROP COLUMN "video_id";
  ALTER TABLE "__works_v_media_split_v" DROP COLUMN "play_video";
  ALTER TABLE "__works_v_media_split_v" DROP COLUMN "video_id";
  ALTER TABLE "__works_v_split_narrow_v" DROP COLUMN "play_video";
  ALTER TABLE "__works_v_split_narrow_v" DROP COLUMN "video_id";
  ALTER TABLE "__works_v_caption_v" DROP COLUMN "play_video";
  ALTER TABLE "__works_v_caption_v" DROP COLUMN "video_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "videos_find";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "videos_id";`)
}
